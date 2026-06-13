import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Printer, ShoppingCart, Pencil, Check, ChevronDown, ChevronUp,
  RefreshCw, UtensilsCrossed, Loader2, X, CornerDownRight,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useLang } from '../LanguageContext';
import type { PlanDay, ShoppingItem, IngredientAmount } from '../types';
import { regenerateDays } from '../planGenerator';

function formatDate(dateStr: string, daysFull: string[], daysShort: string[], locale: string, short = false) {
  const d = new Date(dateStr);
  const dayName = short ? daysShort[d.getDay()] : daysFull[d.getDay()];
  return `${dayName}, ${d.toLocaleDateString(locale, { day: 'numeric', month: short ? 'numeric' : 'long' })}`;
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
        if (existing.unit === item.unit) existing.amount += numAmount;
      } else {
        map.set(item.ingredientId, { amount: numAmount, unit: item.unit, ingredientId: item.ingredientId });
      }
    }
  };

  for (const day of days) {
    if (day.isSpanContinuation) continue;
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
  const { t } = useLang();
  const [tab, setTab] = useState<'plan' | 'shopping'>('plan');
  const [editDayIdx, setEditDayIdx] = useState<number | null>(null);
  const [expandedDayIdx, setExpandedDayIdx] = useState<number | null>(null);

  const [regenMode, setRegenMode] = useState(false);
  const [keptDays, setKeptDays] = useState<Set<number>>(new Set());
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState('');

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
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">{t.planDetail.notFound}</p>
        <Link to="/" className="text-amber-600 underline">{t.planDetail.backToPlans}</Link>
      </div>
    );
  }

  const shopping = data.planShopping.find((ps) => ps.planId === id);

  const updateDay = (idx: number, day: PlanDay) => {
    setData((p) => ({
      ...p,
      plans: p.plans.map((pl) =>
        pl.id === id ? { ...pl, days: pl.days.map((d, i) => (i === idx ? day : d)) } : pl
      ),
    }));
  };

  const rebuildShopping = () => {
    const items = buildShoppingItems(plan.days, data);
    setData((p) => ({
      ...p,
      planShopping: p.planShopping.map((ps) => (ps.planId === id ? { ...ps, items } : ps)),
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

  const enterRegenMode = () => {
    setRegenMode(true);
    setKeptDays(new Set(plan.days.map((_, i) => i)));
    setRegenError('');
    setEditDayIdx(null);
    setExpandedDayIdx(null);
  };

  const exitRegenMode = () => {
    setRegenMode(false);
    setKeptDays(new Set());
    setRegenError('');
  };

  const toggleDayRegen = (idx: number) => {
    setKeptDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAllRegen = () => {
    const allKept = keptDays.size === plan.days.length;
    setKeptDays(allKept ? new Set() : new Set(plan.days.map((_, i) => i)));
  };

  const doRegenerate = () => {
    const toRegen = plan.days.map((_, i) => i).filter((i) => !keptDays.has(i));
    if (toRegen.length === 0) return;
    setRegenError('');
    setRegenLoading(true);
    setTimeout(() => {
      try {
        const newPlan = regenerateDays(data, plan, toRegen);
        if (!newPlan) {
          setRegenError(t.planDetail.regenModeInstruction);
          setRegenLoading(false);
          return;
        }
        setData((p) => ({
          ...p,
          plans: p.plans.map((pl) => (pl.id === id ? newPlan : pl)),
        }));
        setKeptDays(new Set(newPlan.days.map((_, i) => i)));
        setRegenLoading(false);
      } catch {
        setRegenError(t.planDetail.regenModeInstruction);
        setRegenLoading(false);
      }
    }, 100);
  };

  const getMeal = (mealId: string) => data.meals.find((m) => m.id === mealId);
  const getSide = (sideId: string) => data.sides.find((s) => s.id === sideId);
  const getIngredientName = (ingId: string) => data.ingredients.find((i) => i.id === ingId)?.name ?? ingId;

  const checkedCount = shopping?.items.filter((i) => i.checked).length ?? 0;
  const totalCount = (shopping?.items.length ?? 0) + data.ingredients.filter((i) => i.isCommon).length;
  const commonCheckedCount = Object.values(shopping?.commonChecked ?? {}).filter(Boolean).length;
  const uncheckedRegenCount = plan.days.length - keptDays.size;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 print:hidden">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 -ml-1">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-800 truncate">{plan.name}</h1>
          <p className="text-xs text-gray-400">{t.plans.daysCount(plan.days.length)}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="p-2.5 border rounded-xl hover:bg-gray-50 text-gray-600"
        >
          <Printer size={19} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 print:hidden bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab('plan')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'plan' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          {t.planDetail.tabPlan}
        </button>
        <button
          onClick={() => setTab('shopping')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'shopping' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          <ShoppingCart size={15} />
          {t.planDetail.tabShopping}
          {checkedCount + commonCheckedCount > 0 && (
            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
              {checkedCount + commonCheckedCount}/{totalCount}
            </span>
          )}
        </button>
      </div>

      {/* PLAN TAB */}
      {tab === 'plan' && (
        <div>
          {regenMode ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-amber-800">
                  {t.planDetail.regenModeInstruction}
                </p>
                <button onClick={toggleAllRegen} className="text-xs text-amber-600 underline">
                  {keptDays.size === plan.days.length ? t.planDetail.deselectAll : t.planDetail.selectAll}
                </button>
              </div>
              {regenError && (
                <p className="text-xs text-red-600 mb-2">{regenError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={doRegenerate}
                  disabled={regenLoading || uncheckedRegenCount === 0}
                  className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-95 transition-transform"
                >
                  {regenLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> {t.planDetail.regenBtnLoading}</>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      {t.planDetail.regenBtn(uncheckedRegenCount)}
                    </>
                  )}
                </button>
                <button
                  onClick={exitRegenMode}
                  className="flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm text-gray-600"
                >
                  <X size={14} /> {t.planDetail.closeBtn}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mb-3 print:hidden">
              <button
                onClick={enterRegenMode}
                className="flex items-center gap-1.5 text-sm px-3 py-2 border rounded-xl hover:bg-gray-50 text-gray-600"
              >
                <RefreshCw size={14} /> {t.planDetail.regenDaysBtn}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="print:block hidden mb-4">
              <h1 className="text-2xl font-bold">{plan.name}</h1>
            </div>
            {plan.days.map((day, idx) => {
              const meal = getMeal(day.mealId);
              const side = getSide(day.sideId);
              const isEditing = editDayIdx === idx;
              const isExpanded = expandedDayIdx === idx;
              const isKept = !regenMode || keptDays.has(idx);
              const isContinuation = day.isSpanContinuation === true;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border overflow-hidden print:border-b print:rounded-none print:shadow-none transition-opacity ${
                    regenMode && !isKept ? 'opacity-50 border-dashed border-amber-300' : ''
                  } ${isContinuation ? 'border-l-2 border-l-amber-300' : ''}`}
                >
                  {isEditing && !regenMode ? (
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-3">
                        {formatDate(day.date, t.daysFull, t.daysShort, t.locale)}
                      </p>
                      <EditDayForm
                        day={day}
                        data={data}
                        onSave={(d) => { updateDay(idx, d); setEditDayIdx(null); }}
                        onCancel={() => setEditDayIdx(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50"
                        onClick={() => {
                          if (regenMode) {
                            toggleDayRegen(idx);
                          } else {
                            setExpandedDayIdx(isExpanded ? null : idx);
                          }
                        }}
                      >
                        {regenMode ? (
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isKept ? 'bg-amber-600 border-amber-600' : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isKept && <Check size={11} className="text-white" />}
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                            {idx + 1}
                          </div>
                        )}
                        {regenMode && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                            {idx + 1}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400">
                            {formatDate(day.date, t.daysFull, t.daysShort, t.locale, true)}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isContinuation && (
                              <CornerDownRight size={13} className="text-amber-400 flex-shrink-0" />
                            )}
                            <p className={`font-semibold text-sm truncate ${isContinuation ? 'text-gray-500' : 'text-gray-800'}`}>
                              {meal ? meal.name : <span className="text-red-400 italic">{t.planDetail.notSelected}</span>}
                              {side && <span className="text-gray-400 font-normal"> + {side.name}</span>}
                            </p>
                            {isContinuation && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                {t.planDetail.continuation}
                              </span>
                            )}
                          </div>
                          {day.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{day.notes}</p>}
                        </div>
                        {!regenMode && (
                          <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditDayIdx(idx); setExpandedDayIdx(null); }}
                              className="p-2 text-gray-300 hover:text-amber-600 rounded-lg"
                            >
                              <Pencil size={16} />
                            </button>
                            {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-300" />}
                          </div>
                        )}
                      </button>

                      {isExpanded && !regenMode && (
                        <div className="px-4 pb-4 border-t bg-gray-50">
                          <div className="space-y-3 mt-3">
                            {meal && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1.5">{t.planDetail.mealIngredients}</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {meal.ingredients.map((ing, i) => (
                                    <li key={i} className="flex justify-between">
                                      <span>{getIngredientName(ing.ingredientId)}</span>
                                      <span className="text-gray-400">{ing.amount} {ing.unit}</span>
                                    </li>
                                  ))}
                                </ul>
                                {meal.recipe && (
                                  <details className="mt-2">
                                    <summary className="text-xs font-semibold text-amber-600 cursor-pointer">{t.planDetail.recipe}</summary>
                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{meal.recipe}</p>
                                  </details>
                                )}
                              </div>
                            )}
                            {side && side.ingredients.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1.5">{t.planDetail.sideIngredients}</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {side.ingredients.map((ing, i) => (
                                    <li key={i} className="flex justify-between">
                                      <span>{getIngredientName(ing.ingredientId)}</span>
                                      <span className="text-gray-400">{ing.amount} {ing.unit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SHOPPING TAB */}
      {tab === 'shopping' && (
        <div>
          <div className="flex items-center justify-between mb-3 print:hidden">
            <p className="text-sm text-gray-500">{t.planDetail.shoppingInstruction}</p>
            <button
              onClick={rebuildShopping}
              className="flex items-center gap-1.5 text-sm px-3 py-2 border rounded-xl hover:bg-gray-50"
            >
              <RefreshCw size={14} /> {t.planDetail.refreshBtn}
            </button>
          </div>

          {/* Plan ingredients */}
          <div className="bg-white rounded-xl border overflow-hidden mb-3">
            <div className="bg-amber-50 px-4 py-3 border-b">
              <p className="font-semibold text-amber-800 text-sm">
                {t.planDetail.planIngredients}
                {shopping && shopping.items.length > 0 && (
                  <span className="ml-2 text-amber-600 font-normal text-xs">
                    {t.planDetail.markedLabel(checkedCount, shopping.items.length)}
                  </span>
                )}
              </p>
            </div>
            {!shopping || shopping.items.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                <UtensilsCrossed size={28} className="mx-auto mb-2 opacity-30" />
                <p>{t.planDetail.noIngredients}</p>
                <p className="text-xs">{t.planDetail.noIngredientsNote}</p>
              </div>
            ) : (
              <ul>
                {shopping.items.map((item) => (
                  <li
                    key={item.ingredientId}
                    className={`flex items-center gap-3 px-4 py-4 border-b last:border-0 active:bg-gray-50 cursor-pointer ${item.checked ? 'opacity-50' : ''}`}
                    onClick={() => toggleShoppingItem(item.ingredientId)}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {item.checked && <Check size={14} className="text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {getIngredientName(item.ingredientId)}
                    </span>
                    {(item.amount || item.unit) && (
                      <span className="text-sm text-gray-400 text-right flex-shrink-0">
                        {item.amount} {item.unit}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Common ingredients */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-yellow-50 px-4 py-3 border-b">
              <p className="font-semibold text-yellow-800 text-sm">
                {t.planDetail.commonIngredients}
                <span className="ml-2 text-yellow-600 font-normal text-xs">
                  {t.planDetail.markedLabel(commonCheckedCount, data.ingredients.filter((i) => i.isCommon).length)}
                </span>
              </p>
            </div>
            <ul>
              {data.ingredients.filter((i) => i.isCommon).map((ing) => {
                const checked = shopping?.commonChecked[ing.id] ?? false;
                return (
                  <li
                    key={ing.id}
                    className={`flex items-center gap-3 px-4 py-4 border-b last:border-0 active:bg-gray-50 cursor-pointer ${checked ? 'opacity-50' : ''}`}
                    onClick={() => toggleCommonItem(ing.id)}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked ? 'bg-green-500 border-green-500' : 'border-yellow-400'
                    }`}>
                      {checked && <Check size={14} className="text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {ing.name}
                    </span>
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
  const { t } = useLang();
  const [mealId, setMealId] = useState(day.mealId);
  const [sideId, setSideId] = useState(day.sideId);
  const [notes, setNotes] = useState(day.notes);

  const selectedMeal = data.meals.find((m) => m.id === mealId);
  const availableSides = selectedMeal
    ? data.sides.filter((s) => selectedMeal.possibleSideIds.includes(s.id))
    : data.sides;

  return (
    <div className="space-y-3">
      <select
        className="w-full border rounded-xl px-4 py-3 text-sm"
        value={mealId}
        onChange={(e) => { setMealId(e.target.value); setSideId(''); }}
      >
        <option value="">{t.planDetail.selectMeal}</option>
        {data.meals.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <select
        className="w-full border rounded-xl px-4 py-3 text-sm"
        value={sideId}
        onChange={(e) => setSideId(e.target.value)}
      >
        <option value="">{t.planDetail.noSide}</option>
        {availableSides.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input
        className="w-full border rounded-xl px-4 py-3 text-sm"
        placeholder={t.planDetail.notesPlaceholder}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ ...day, mealId, sideId, notes })}
          className="flex-1 bg-amber-600 text-white py-3 rounded-xl text-sm font-medium"
        >
          {t.planDetail.saveBtn}
        </button>
        <button onClick={onCancel} className="flex-1 border py-3 rounded-xl text-sm font-medium text-gray-600">
          {t.planDetail.cancelBtn}
        </button>
      </div>
    </div>
  );
}
