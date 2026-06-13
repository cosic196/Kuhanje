import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Trash2, Loader2, ChevronRight, Check, RefreshCw, Ban } from 'lucide-react';
import { useApp } from '../AppContext';
import { useLang } from '../LanguageContext';
import Modal from '../components/Modal';
import { generatePlan, regenerateDays } from '../planGenerator';
import type { Plan } from '../types';

function formatDayShort(dateStr: string, daysShort: string[], locale: string) {
  const d = new Date(dateStr);
  return `${daysShort[d.getDay()]}, ${d.toLocaleDateString(locale, { day: 'numeric', month: 'numeric' })}`;
}

export default function Plans() {
  const { data, setData } = useApp();
  const { t } = useLang();
  const [showNew, setShowNew] = useState(false);
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [proposedPlan, setProposedPlan] = useState<Plan | null>(null);
  const [keptDays, setKeptDays] = useState<Set<number>>(new Set());
  const [skippedDays, setSkippedDays] = useState<Set<number>>(new Set());

  const removePlan = (id: string) => {
    if (!confirm(t.plans.deletePlan)) return;
    setData((p) => ({
      ...p,
      plans: p.plans.filter((pl) => pl.id !== id),
      planShopping: p.planShopping.filter((ps) => ps.planId !== id),
    }));
  };

  const openNew = () => {
    setProposedPlan(null);
    setKeptDays(new Set());
    setSkippedDays(new Set());
    setError('');
    setPlanName('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setShowNew(true);
  };

  const cancelNew = () => {
    setShowNew(false);
    setProposedPlan(null);
    setKeptDays(new Set());
    setSkippedDays(new Set());
    setError('');
  };

  const generate = () => {
    setError('');
    setGenerating(true);
    setTimeout(() => {
      try {
        const dateLabel = new Date(startDate).toLocaleDateString(t.locale);
        const name = planName.trim() || t.plans.planNamePlaceholder(dateLabel);
        const plan = generatePlan(data, name, startDate);
        if (!plan) {
          setError(t.plans.errorGenerate);
          setGenerating(false);
          return;
        }
        setProposedPlan(plan);
        setKeptDays(new Set(plan.days.map((_, i) => i)));
        setGenerating(false);
      } catch {
        setError(t.plans.errorGenerateShort);
        setGenerating(false);
      }
    }, 100);
  };

  const doRegenerateSelected = () => {
    if (!proposedPlan) return;
    const toRegen = proposedPlan.days.map((_, i) => i).filter((i) => !keptDays.has(i) && !skippedDays.has(i));
    if (toRegen.length === 0) return;
    setError('');
    setGenerating(true);
    setTimeout(() => {
      try {
        const newPlan = regenerateDays(data, proposedPlan, toRegen);
        if (!newPlan) {
          setError(t.plans.errorRegenerate);
          setGenerating(false);
          return;
        }
        setProposedPlan(newPlan);
        setKeptDays(new Set(newPlan.days.map((_, i) => i)));
        setGenerating(false);
      } catch {
        setError(t.plans.errorRegenerateShort);
        setGenerating(false);
      }
    }, 100);
  };

  const confirmPlan = () => {
    if (!proposedPlan) return;
    const finalPlan = {
      ...proposedPlan,
      days: proposedPlan.days.map((day, idx) =>
        skippedDays.has(idx)
          ? { ...day, mealId: '', sideId: '', skipped: true as const }
          : day
      ),
    };
    setData((p) => ({ ...p, plans: [finalPlan, ...p.plans].slice(0, 10) }));
    cancelNew();
  };

  const toggleDay = (idx: number) => {
    if (skippedDays.has(idx)) return;
    setKeptDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSkipDay = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSkippedDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
    setKeptDays((prev) => new Set([...prev, idx]));
  };

  const toggleAll = () => {
    if (!proposedPlan) return;
    const allKept = keptDays.size === proposedPlan.days.length;
    setKeptDays(allKept ? new Set([...skippedDays]) : new Set(proposedPlan.days.map((_, i) => i)));
  };

  const formatDateRange = (plan: { startDate: string; days: unknown[] }) => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.startDate);
    end.setDate(end.getDate() + plan.days.length - 1);
    return `${start.toLocaleDateString(t.locale, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(t.locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const uncheckedCount = proposedPlan
    ? proposedPlan.days.filter((_, i) => !keptDays.has(i) && !skippedDays.has(i)).length
    : 0;
  const startDateFormatted = new Date(startDate).toLocaleDateString(t.locale);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.plans.title}</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 font-medium text-sm active:scale-95 transition-transform"
        >
          <Plus size={18} /> {t.plans.newPlan}
        </button>
      </div>

      {data.meals.length < 5 && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-sm text-amber-800 dark:text-amber-200">
          {t.plans.addMealsPrompt}{' '}
          <Link to="/jela" className="underline font-medium">
            {t.plans.addMealsLink}
          </Link>
        </div>
      )}

      {data.plans.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <Calendar size={52} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">{t.plans.noPlanTitle}</p>
          <p className="text-sm mt-1">{t.plans.noPlanSub}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/plan/${plan.id}`}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <div className="bg-amber-100 dark:bg-amber-900/40 rounded-xl p-2.5 flex-shrink-0">
                <Calendar size={22} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{plan.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateRange(plan)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{t.plans.daysCount(plan.days.length)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removePlan(plan.id);
                  }}
                  className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-400 active:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNew && (
        <Modal
          title={proposedPlan ? t.plans.modalTitleProposal : t.plans.modalTitleNew}
          onClose={cancelNew}
        >
          {!proposedPlan ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  {t.plans.planNameLabel}
                </label>
                <input
                  className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder={t.plans.planNamePlaceholder(startDateFormatted)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  {t.plans.startDateLabel}
                </label>
                <input
                  type="date"
                  className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-300">
                {t.plans.durationInfo(data.settings.planDurationDays)}
                <span className="text-gray-400 dark:text-gray-500 ml-1">{t.plans.durationNote}</span>
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
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
                    <Loader2 size={20} className="animate-spin" /> {t.plans.generatingBtn}
                  </>
                ) : (
                  t.plans.generateBtn
                )}
              </button>
              <button
                onClick={cancelNew}
                className="w-full border dark:border-gray-600 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-600 dark:text-gray-300"
              >
                {t.plans.cancelBtn}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.plans.deselectInstruction}
                </p>
                <button
                  onClick={toggleAll}
                  className="text-xs text-amber-600 underline flex-shrink-0 ml-2"
                >
                  {keptDays.size === proposedPlan.days.length ? t.plans.deselectAll : t.plans.selectAll}
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto -mx-1 px-1">
                {proposedPlan.days.map((day, idx) => {
                  const meal = data.meals.find((m) => m.id === day.mealId);
                  const side = data.sides.find((s) => s.id === day.sideId);
                  const isKept = keptDays.has(idx);
                  const isSkipped = skippedDays.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      className={`w-full flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer select-none ${
                        isSkipped
                          ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          : isKept
                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-dashed border-amber-300 dark:border-amber-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSkipped
                            ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
                            : isKept
                              ? 'bg-amber-600 border-amber-600'
                              : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
                        }`}
                      >
                        {isKept && !isSkipped && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex-shrink-0 w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                          {formatDayShort(day.date, t.daysShort, t.locale)}
                        </p>
                        {isSkipped ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic">{t.plans.skipped}</p>
                        ) : (
                          <p className={`text-sm font-medium truncate ${isKept ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                            {meal?.name ?? (
                              <span className="text-red-400 italic text-xs">{t.plans.notSelected}</span>
                            )}
                            {side && (
                              <span className="font-normal text-gray-400 dark:text-gray-500"> + {side.name}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => toggleSkipDay(e, idx)}
                        title={isSkipped ? t.plans.skipped : t.plans.skipDay}
                        className={`p-1 rounded-lg flex-shrink-0 transition-colors ${
                          isSkipped
                            ? 'text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/30'
                            : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Ban size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={doRegenerateSelected}
                disabled={generating || uncheckedCount === 0}
                className="w-full border border-amber-600 text-amber-700 dark:text-amber-400 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-transform"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {t.plans.generatingBtn}
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    {t.plans.regenerateBtn}
                    {uncheckedCount > 0 && (
                      <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs px-1.5 py-0.5 rounded-full">
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
                <Check size={18} /> {t.plans.confirmBtn}
              </button>

              <button
                onClick={cancelNew}
                className="w-full border dark:border-gray-600 py-3.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                {t.plans.cancelBtn}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
