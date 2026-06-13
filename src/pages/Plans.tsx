import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { useApp } from '../AppContext';
import Modal from '../components/Modal';
import { generatePlan } from '../planGenerator';

export default function Plans() {
  const { data, setData } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const removePlan = (id: string) => {
    if (!confirm('Obrisati ovaj plan?')) return;
    setData((p) => ({
      ...p,
      plans: p.plans.filter((pl) => pl.id !== id),
      planShopping: p.planShopping.filter((ps) => ps.planId !== id),
    }));
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
        setData((p) => ({ ...p, plans: [plan, ...p.plans] }));
        setShowNew(false);
        setPlanName('');
        setGenerating(false);
      } catch {
        setError('Greška pri generiranju plana.');
        setGenerating(false);
      }
    }, 100);
  };

  const formatDateRange = (plan: { startDate: string; days: unknown[] }) => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.startDate);
    end.setDate(end.getDate() + plan.days.length - 1);
    return `${start.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Planovi obroka</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 font-medium text-sm active:scale-95 transition-transform"
        >
          <Plus size={18} /> Novi plan
        </button>
      </div>

      {data.meals.length < 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Za generiranje plana dodajte najmanje 5 jela.{' '}
          <Link to="/jela" className="underline font-medium">Dodajte jela →</Link>
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
                  onClick={(e) => { e.preventDefault(); removePlan(plan.id); }}
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
        <Modal title="Novi plan" onClose={() => setShowNew(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv plana (neobavezno)</label>
              <input
                className="w-full border rounded-xl px-4 py-3"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={`Plan ${new Date(startDate).toLocaleDateString('hr-HR')}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Datum početka</label>
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
              {generating ? <><Loader2 size={20} className="animate-spin" /> Generiranje...</> : 'Generiraj plan'}
            </button>
            <button onClick={() => setShowNew(false)} className="w-full border py-3.5 rounded-xl hover:bg-gray-50 font-medium text-gray-600">
              Odustani
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
