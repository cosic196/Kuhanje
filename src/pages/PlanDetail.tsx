import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Printer, ShoppingCart, Pencil, Check, ChevronDown, ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../AppContext';
import type { PlanDay, ShoppingItem, IngredientAmount } from '../types';

const DAYS_HR = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS_HR[d.getDay()]}, ${d.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long' })}`;
}

function buildShoppingItems(
  days: PlanDay[],
  data: ReturnType<typeof useApp>['data']
): ShoppingItem[] {
  const map = new Map<string, { amount: number; unit: string; ingredientId: string }>();

  const addItems = (items: IngredientAmount[]) => {
    for (const item of items) {
      if (!item.ingredientId) continue;
      const ing = data.ingredients.find((i) => i.id === item.ingredientId);
      if (!ing || ing.isCommon) continue;

      const numAmount = parseFloat(item.amount) || 0;
      if (map.has(item.ingredientId)) {
        const existing = map.get(item.ingredientId)!;
        if (existing.unit === item.unit) {
          existing.amount += numAmount;
        }
      } else {
        map.set(item.ingredientId, { amount: numAmount, unit: item.unit, ingredientId: item.ingredientId });
      }
    }
  };

  for (const day of days) {
    if (day.mealId) {
      const meal = data.meals.find((m) => m.id === day.mealId);
      if (meal) addItems(meal.ingredients);
    }
    if (day.sideId) {
      const side = data.sides.find((s) => s.id === day.sideId);
      if (side) addItems(side.ingredients);
    }
  }

  return Array.from(map.values()).map((v) => ({
    ingredientId: v.ingredientId,
    amount: v.amount > 0 ? v.amount.toString() : '',
    unit: v.unit,
    checked: false,
  }));
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, setData } = useApp();
  const [tab, setTab] = useState<'plan' | 'shopping'>('plan');
  const [editDayIdx, setEditDayIdx] = useState<number | null>(null);
  const [expandedDayIdx, setExpandedDayIdx] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const plan = data.plans.find((p) => p.id === id);

  useEffect(() => {
    if (plan && !data.planShopping.find((ps) => ps.planId === id)) {
      const items = buildShoppingItems(plan.days, data);
      const commonChecked: Record<string, boolean> = {};
      data.ingredients.filter((i) => i.isCommon).forEach((i) => { commonChecked[i.id] = false; });
      setData((p) => ({
        ...p,
        planShopping: [...p.planShopping, { planId: id!, items, commonChecked }],
      }));
    }
  }, [plan?.id]);

  if (!plan) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Plan nije pronađen.</p>
        <Link to="/" className="text-amber-600 underline">Povratak na planove</Link>
      </div>
    );
  }

  const shopping = data.planShopping.find((ps) => ps.planId === id);

  const updateDay = (idx: number, day: PlanDay) => {
    setData((p) => ({
      ...p,
      plans: p.plans.map((pl) =>
        pl.id === id ? { ...pl, days: pl.days.map((d, i) => i === idx ? day : d) } : pl
      ),
    }));
  };

  const rebuildShopping = () => {
    const items = buildShoppingItems(plan.days, data);
    setData((p) => ({
      ...p,
      planShopping: p.planShopping.map((ps) =>
        ps.planId === id ? { ...ps, items } : ps
      ),
    }));
  };

  const toggleShoppingItem = (ingredientId: string) => {
    setData((p) => ({
      ...p,
      planShopping: p.planShopping.map((ps) =>
        ps.planId === id
          ? { ...ps, items: ps.items.map((it) => it.ingredientId === ingredientId ? { ...it, checked: !it.checked } : it) }
          : ps
      ),
    }));
  };

  const toggleCommonItem = (ingredientId: string) => {
    setData((p) => ({
      ...p,
      planShopping: p.planShopping.map((ps) =>
        ps.planId === id
          ? { ...ps, commonChecked: { ...ps.commonChecked, [ingredientId]: !ps.commonChecked[ingredientId] } }
          : ps
      ),
    }));
  };

  const getMeal = (id: string) => data.meals.find((m) => m.id === id);
  const getSide = (id: string) => data.sides.find((s) => s.id === id);
  const getIngredientName = (id: string) => data.ingredients.find((i) => i.id === id)?.name ?? id;

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">{plan.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm"
          >
            <Printer size={16} /> Ispis
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 print:hidden">
        <button
          onClick={() => setTab('plan')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'plan' ? 'bg-amber-600 text-white' : 'border hover:bg-gray-50'}`}
        >
          Plan obroka
        </button>
        <button
          onClick={() => setTab('shopping')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === 'shopping' ? 'bg-amber-600 text-white' : 'border hover:bg-gray-50'}`}
        >
          <ShoppingCart size={16} /> Lista za kupovinu
        </button>
      </div>

      {/* PLAN TAB */}
      {tab === 'plan' && (
        <div className="space-y-2 print:space-y-4" ref={printRef}>
          <div className="print:block hidden mb-4">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <p className="text-gray-500 text-sm">
              {new Date(plan.startDate).toLocaleDateString('hr-HR')} – {new Date(plan.days[plan.days.length-1]?.date ?? plan.startDate).toLocaleDateString('hr-HR')}
            </p>
          </div>
          {plan.days.map((day, idx) => {
            const meal = getMeal(day.mealId);
            const side = getSide(day.sideId);
            const isEditing = editDayIdx === idx;
            const isExpanded = expandedDayIdx === idx;

            return (
              <div key={idx} className="bg-white rounded-xl border print:border-b print:rounded-none print:shadow-none shadow-sm">
                <div className="flex items-center gap-3 p-3 print:py-2">
                  <div className="bg-amber-100 text-amber-700 rounded-lg px-2 py-1 text-xs font-bold min-w-[2.5rem] text-center print:bg-transparent print:text-gray-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">{formatDate(day.date)}</div>
                    {isEditing ? (
                      <EditDayForm
                        day={day}
                        data={data}
                        onSave={(d) => { updateDay(idx, d); setEditDayIdx(null); }}
                        onCancel={() => setEditDayIdx(null)}
                      />
                    ) : (
                      <div>
                        <span className="font-semibold text-gray-800">
                          {meal ? meal.name : <span className="text-red-400 italic">Nije odabrano jelo</span>}
                        </span>
                        {side && <span className="text-gray-500"> + {side.name}</span>}
                        {day.notes && <p className="text-xs text-gray-400 mt-0.5">{day.notes}</p>}
                      </div>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex gap-1 print:hidden flex-shrink-0">
                      <button
                        onClick={() => setExpandedDayIdx(isExpanded ? null : idx)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title="Detalji"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => setEditDayIdx(idx)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded"
                        title="Uredi"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  )}
                </div>
                {isExpanded && !isEditing && (
                  <div className="px-4 pb-3 border-t bg-gray-50 rounded-b-xl print:hidden">
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      {meal && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Sastojci jela:</p>
                          <ul className="text-xs text-gray-600 space-y-0.5">
                            {meal.ingredients.map((ing, i) => (
                              <li key={i}>{getIngredientName(ing.ingredientId)} {ing.amount} {ing.unit}</li>
                            ))}
                          </ul>
                          {meal.recipe && (
                            <details className="mt-2">
                              <summary className="text-xs font-semibold text-amber-600 cursor-pointer">Recept</summary>
                              <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{meal.recipe}</p>
                            </details>
                          )}
                        </div>
                      )}
                      {side && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Sastojci dodatka:</p>
                          <ul className="text-xs text-gray-600 space-y-0.5">
                            {side.ingredients.map((ing, i) => (
                              <li key={i}>{getIngredientName(ing.ingredientId)} {ing.amount} {ing.unit}</li>
                            ))}
                          </ul>
                          {side.recipe && (
                            <details className="mt-2">
                              <summary className="text-xs font-semibold text-amber-600 cursor-pointer">Recept za prilog</summary>
                              <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{side.recipe}</p>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SHOPPING TAB */}
      {tab === 'shopping' && (
        <div>
          <div className="flex items-center justify-between mb-4 print:hidden">
            <p className="text-sm text-gray-500">Odaberite što trebate kupiti</p>
            <div className="flex gap-2">
              <button
                onClick={rebuildShopping}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                title="Regeneriraj listu iz plana"
              >
                <RefreshCw size={14} /> Osvježi
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              >
                <Printer size={14} /> Ispis
              </button>
            </div>
          </div>

          <div className="print:block hidden mb-4">
            <h1 className="text-2xl font-bold">Lista za kupovinu</h1>
            <p className="text-gray-500 text-sm">{plan.name}</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-4">
            <div className="bg-amber-50 px-4 py-2 border-b">
              <h3 className="font-semibold text-amber-800 text-sm">Sastojci za plan</h3>
            </div>
            {!shopping || shopping.items.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-400">
                Nema sastojaka (dodajte sastojke jelima i dodacima).
              </p>
            ) : (
              <ul className="divide-y">
                {shopping.items.map((item) => (
                  <li
                    key={item.ingredientId}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${item.checked ? 'opacity-50' : ''}`}
                    onClick={() => toggleShoppingItem(item.ingredientId)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {item.checked && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {getIngredientName(item.ingredientId)}
                    </span>
                    <span className="text-sm text-gray-500 text-right">
                      {item.amount} {item.unit}
                    </span>
                    <span className="print:hidden w-5 h-5 rounded border border-gray-300 flex items-center justify-center print:block" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-yellow-50 px-4 py-2 border-b">
              <h3 className="font-semibold text-yellow-800 text-sm">⭐ Zajednički sastojci (uvijek potrebni)</h3>
            </div>
            <ul className="divide-y">
              {data.ingredients.filter((i) => i.isCommon).map((ing) => {
                const checked = shopping?.commonChecked[ing.id] ?? false;
                return (
                  <li
                    key={ing.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${checked ? 'opacity-50' : ''}`}
                    onClick={() => toggleCommonItem(ing.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'bg-green-500 border-green-500' : 'border-yellow-400'}`}>
                      {checked && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {ing.name}
                    </span>
                    <span className="print:hidden w-5 h-5 rounded border border-gray-300 flex items-center justify-center" />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function EditDayForm({
  day,
  data,
  onSave,
  onCancel,
}: {
  day: PlanDay;
  data: ReturnType<typeof useApp>['data'];
  onSave: (d: PlanDay) => void;
  onCancel: () => void;
}) {
  const [mealId, setMealId] = useState(day.mealId);
  const [sideId, setSideId] = useState(day.sideId);
  const [notes, setNotes] = useState(day.notes);

  const selectedMeal = data.meals.find((m) => m.id === mealId);
  const availableSides = selectedMeal
    ? data.sides.filter((s) => selectedMeal.possibleSideIds.includes(s.id))
    : data.sides;

  return (
    <div className="space-y-2 mt-1">
      <select
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
        value={mealId}
        onChange={(e) => { setMealId(e.target.value); setSideId(''); }}
      >
        <option value="">-- Odaberi jelo --</option>
        {data.meals.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <select
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
        value={sideId}
        onChange={(e) => setSideId(e.target.value)}
      >
        <option value="">-- Bez dodatka --</option>
        {availableSides.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
        placeholder="Bilješka..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ ...day, mealId, sideId, notes })}
          className="flex-1 bg-amber-600 text-white py-1.5 rounded-lg text-sm hover:bg-amber-700"
        >
          Spremi
        </button>
        <button onClick={onCancel} className="flex-1 border py-1.5 rounded-lg text-sm hover:bg-gray-50">
          Odustani
        </button>
      </div>
    </div>
  );
}
