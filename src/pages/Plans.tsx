import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Trash2, Eye, Loader2 } from 'lucide-react';
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
      } catch (e) {
        setError('Greška pri generiranju plana.');
        setGenerating(false);
      }
    }, 100);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });

  const getEndDate = (plan: { startDate: string; days: unknown[] }) => {
    const d = new Date(plan.startDate);
    d.setDate(d.getDate() + plan.days.length - 1);
    return d.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-amber-600" /> Planovi obroka
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium"
        >
          <Plus size={18} /> Novi plan
        </button>
      </div>

      {data.meals.length < 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          Za generiranje plana potrebno je dodati najmanje 5-10 jela.{' '}
          <Link to="/jela" className="underline font-medium">Dodajte jela →</Link>
        </div>
      )}

      {data.plans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nema planova. Generirajte prvi plan!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-amber-100 rounded-lg p-3">
                <Calendar size={24} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(plan.startDate)} – {getEndDate(plan)}
                </p>
                <p className="text-xs text-gray-400">{plan.days.length} dana</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  to={`/plan/${plan.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                >
                  <Eye size={15} /> Otvori
                </Link>
                <button
                  onClick={() => removePlan(plan.id)}
                  className="p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <Modal title="Generiraj novi plan" onClose={() => setShowNew(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naziv plana (neobavezno)</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={`Plan ${new Date(startDate).toLocaleDateString('hr-HR')}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum početka</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <p>Trajanje plana: <strong>{data.settings.planDurationDays} dana</strong></p>
              <p className="text-xs text-gray-400 mt-1">
                Promijenite u Pravila i postavke.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={generate}
                disabled={generating}
                className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {generating ? <><Loader2 size={18} className="animate-spin" /> Generiranje...</> : 'Generiraj plan'}
              </button>
              <button onClick={() => setShowNew(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">
                Odustani
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
