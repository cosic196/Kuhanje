import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Trash2, Loader2, ChevronRight, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../AppContext';
import Modal from '../components/Modal';
import { generatePlan, regenerateDays } from '../planGenerator';
import type { Plan } from '../types';

const DAYS_SHORT = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];

function formatDayShort(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS_SHORT[d.getDay()]}, ${d.toLocaleDateString('hr-HR', { day: 'numeric', month: 'numeric' })}`;
}

export default function Plans() {
  const { data, setData } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Proposal state (poker flow)
  const [proposedPlan, setProposedPlan] = useState<Plan | null>(null);
  const [keptDays, setKeptDays] = useState<Set<number>>(new Set());

  const removePlan = (id: string) => {
    if (!confirm('Obrisati ovaj plan?')) return;
    setData((p) => ({
      ...p,
      plans: p.plans.filter((pl) => pl.id !== id),
      planShopping: p.planShopping.filter((ps) => ps.planId !== id),
    }));
  };

  const openNew = () => {
    setProposedPlan(null);
    setKeptDays(new Set());
    setError('');
    setPlanName('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setShowNew(true);
  };

  const cancelNew = () => {
    setShowNew(false);
    setProposedPlan(null);
    setKeptDays(new Set());
    setError('');
  };

  const generate = () => {
    setError('');
    setGenerating(true);
    setTimeout(() => {
      try {
        const name = planName.trim() || `Plan ${new Date(startDate).toLocaleDateString('hr-HR')}`;
        const plan = generatePlan(data, name, startDate);
        if (!plan) {
          setError('Nije moguće generirati plan. Provjerite imate li dovoljno jela i da pravila nisu prestroga.');
          setGenerating(false);
          return;
        }
        setProposedPlan(plan);
        setKeptDays(new Set(plan.days.map((_, i) => i)));
        setGenerating(false);
      } catch {
        setError('Greška pri generiranju plana.');
        setGenerating(false);
      }
    }, 100);
  };

  const doRegenerateSelected = () => {
    if (!proposedPlan) return;
    const toRegen = proposedPlan.days.map((_, i) => i).filter((i) => !keptDays.has(i));
    if (toRegen.length === 0) return;
    setError('');
    setGenerating(true);
    setTimeout(() => {
      try {
        const newPlan = regenerateDays(data, proposedPlan, toRegen);
        if (!newPlan) {
          setError('Nije moguće regenerirati dane. Pokušajte opet ili smanjite ograničenja.');
          setGenerating(false);
          return;
        }
        setProposedPlan(newPlan);
        setKeptDays(new Set(newPlan.days.map((_, i) => i)));
        setGenerating(false);
      } catch {
        setError('Greška pri regeneriranju.');
        setGenerating(false);
      }
    }, 100);
  };

  const confirmPlan = () => {
    if (!proposedPlan) return;
    setData((p) => ({ ...p, plans: [proposedPlan, ...p.plans].slice(0, 10) }));
    cancelNew();
  };

  const toggleDay = (idx: number) => {
    setKeptDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (!proposedPlan) return;
    const allKept = keptDays.size === proposedPlan.days.length;
    setKeptDays(allKept ? new Set() : new Set(proposedPlan.days.map((_, i) => i)));
  };

  const formatDateRange = (plan: { startDate: string; days: unknown[] }) => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.startDate);
    end.setDate(end.getDate() + plan.days.length - 1);
    return `${start.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const uncheckedCount = proposedPlan ? proposedPlan.days.length - keptDays.size : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Planovi obroka</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 font-medium text-sm active:scale-95 transition-transform"
        >
          <Plus size={18} /> Novi plan
        </button>
      </div>

      {data.meals.length < 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Za generiranje plana dodajte najmanje 5 jela.{' '}
          <Link to="/jela" className="underline font-medium">
            Dodajte jela →
          </Link>
        </div>
      )}

      {data.plans.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={52} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nema planova</p>
          <p className="text-sm mt-1">Generirajte prvi plan obroka!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/plan/${plan.id}`}
              className="flex items-center gap-3 bg-white rounded-xl border p-4 active:bg-gray-50 transition-colors"
            >
              <div className="bg-amber-100 rounded-xl p-2.5 flex-shrink-0">
                <Calendar size={22} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{plan.name}</p>
                <p className="text-sm text-gray-500">{formatDateRange(plan)}</p>
                <p className="text-xs text-gray-400">{plan.days.length} dana</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removePlan(plan.id);
                  }}
                  className="p-2 text-gray-300 hover:text-red-400 active:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNew && (
        <Modal
          title={proposedPlan ? 'Prijedlog plana' : 'Novi plan'}
          onClose={cancelNew}
        >
          {!proposedPlan ? (
            /* Step 1: Name + date form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Naziv plana (neobavezno)
                </label>
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder={`Plan ${new Date(startDate).toLocaleDateString('hr-HR')}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Datum početka
                </label>
                <input
                  type="date"
                  className="w-full border rounded-xl px-4 py-3"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                Trajanje: <strong>{data.settings.planDurationDays} dana</strong>
                <span className="text-gray-400 ml-1">(može se promijeniti u Pravilima)</span>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                onClick={generate}
                disabled={generating}
                className="w-full bg-amber-600 text-white py-3.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform text-base"
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Generiranje...
                  </>
                ) : (
                  'Generiraj plan'
                )}
              </button>
              <button
                onClick={cancelNew}
                className="w-full border py-3.5 rounded-xl hover:bg-gray-50 font-medium text-gray-600"
              >
                Odustani
              </button>
            </div>
          ) : (
            /* Step 2: Proposal with poker-like day selection */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Odznači dane koje želiš promijeniti.
                </p>
                <button
                  onClick={toggleAll}
                  className="text-xs text-amber-600 underline flex-shrink-0 ml-2"
                >
                  {keptDays.size === proposedPlan.days.length ? 'Odznači sve' : 'Označi sve'}
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto -mx-1 px-1">
                {proposedPlan.days.map((day, idx) => {
                  const meal = data.meals.find((m) => m.id === day.mealId);
                  const side = data.sides.find((s) => s.id === day.sideId);
                  const isKept = keptDays.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      className={`w-full flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
                        isKept
                          ? 'bg-white border-gray-200'
                          : 'bg-gray-50 border-dashed border-amber-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isKept ? 'bg-amber-600 border-amber-600' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isKept && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex-shrink-0 w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                          {formatDayShort(day.date)}
                        </p>
                        <p className={`text-sm font-medium truncate ${isKept ? 'text-gray-800' : 'text-gray-400'}`}>
                          {meal?.name ?? (
                            <span className="text-red-400 italic text-xs">Nije odabrano</span>
                          )}
                          {side && (
                            <span className="font-normal text-gray-400"> + {side.name}</span>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={doRegenerateSelected}
                disabled={generating || uncheckedCount === 0}
                className="w-full border border-amber-600 text-amber-700 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generiranje...
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    Regeneriraj neoznačene
                    {uncheckedCount > 0 && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                        {uncheckedCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={confirmPlan}
                disabled={generating}
                className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-medium text-base flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Check size={18} /> Potvrdi plan
              </button>

              <button
                onClick={cancelNew}
                className="w-full border py-3.5 rounded-xl text-sm font-medium text-gray-600"
              >
                Odustani
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
