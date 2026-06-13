import { Settings, Plus, Trash2, ToggleLeft, ToggleRight, Download, Upload } from 'lucide-react';
import { useApp } from '../AppContext';
import type { PlanRule, NoRepeatSideCategoryRule, RequiredCategoryRule, NoRecentMealsRule } from '../types';
import { generateId, exportData, importData } from '../storage';

function RuleCard({ rule, onUpdate, onDelete }: {
  rule: PlanRule;
  onUpdate: (r: PlanRule) => void;
  onDelete: () => void;
}) {
  const { data } = useApp();

  const toggle = () => onUpdate({ ...rule, enabled: !rule.enabled } as PlanRule);

  if (rule.type === 'no_repeat_side_category') {
    const r = rule as NoRepeatSideCategoryRule;
    return (
      <div className={`bg-white rounded-xl border p-4 ${!r.enabled ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={toggle} className="text-amber-600">
                {r.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-gray-400" />}
              </button>
              <span className="font-medium text-gray-800">Ne ponavljaj kategoriju dodatka unutar N dana</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label className="text-sm text-gray-600">Prozor dana:</label>
              <input
                type="number"
                min={2}
                max={14}
                className="w-16 border rounded px-2 py-1 text-sm"
                value={r.windowDays}
                onChange={(e) => onUpdate({ ...r, windowDays: Number(e.target.value) })}
              />
              <span className="text-sm text-gray-500">
                (ista kategorija dodatka ne smije se pojaviti u {r.windowDays} uzastopnih dana)
              </span>
            </div>
          </div>
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (rule.type === 'required_category') {
    const r = rule as RequiredCategoryRule;
    const cats = r.categoryType === 'meal' ? data.mealCategories : data.sideCategories;
    return (
      <div className={`bg-white rounded-xl border p-4 ${!r.enabled ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={toggle} className="text-amber-600">
                {r.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-gray-400" />}
              </button>
              <span className="font-medium text-gray-800">Obavezna kategorija</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tip</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={r.categoryType}
                  onChange={(e) => onUpdate({ ...r, categoryType: e.target.value as 'meal' | 'side', categoryId: '' })}
                >
                  <option value="meal">Jelo</option>
                  <option value="side">Dodatak</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Kategorija</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={r.categoryId}
                  onChange={(e) => onUpdate({ ...r, categoryId: e.target.value })}
                >
                  <option value="">-- Odaberi --</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Min. broj puta</label>
                <input type="number" min={1} max={7} className="w-full border rounded px-2 py-1 text-sm" value={r.minCount}
                  onChange={(e) => onUpdate({ ...r, minCount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Na svakih N dana</label>
                <input type="number" min={1} max={14} className="w-full border rounded px-2 py-1 text-sm" value={r.everyNDays}
                  onChange={(e) => onUpdate({ ...r, everyNDays: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={r.consecutive} className="accent-amber-600"
                    onChange={(e) => onUpdate({ ...r, consecutive: e.target.checked })} />
                  Uzastopni dani
                  {r.consecutive && (
                    <input type="number" min={2} max={7} className="w-14 border rounded px-2 py-1 text-sm" value={r.consecutiveDays}
                      onChange={(e) => onUpdate({ ...r, consecutiveDays: Number(e.target.value) })} />
                  )}
                  {r.consecutive && <span className="text-xs text-gray-500">dana uzastopno</span>}
                </label>
              </div>
            </div>
          </div>
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (rule.type === 'no_recent_meals') {
    const r = rule as NoRecentMealsRule;
    return (
      <div className={`bg-white rounded-xl border p-4 ${!r.enabled ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={toggle} className="text-amber-600">
                {r.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-gray-400" />}
              </button>
              <span className="font-medium text-gray-800">Izbjegavaj nedavna jela</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label className="text-sm text-gray-600">Ne koristi jela iz zadnjih</label>
              <input type="number" min={1} max={60} className="w-16 border rounded px-2 py-1 text-sm" value={r.recentDays}
                onChange={(e) => onUpdate({ ...r, recentDays: Number(e.target.value) })} />
              <span className="text-sm text-gray-500">dana</span>
            </div>
          </div>
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function Rules() {
  const { data, setData } = useApp();

  const update = (id: string, rule: PlanRule) =>
    setData((p) => ({ ...p, rules: p.rules.map((r) => r.id === id ? rule : r) }));

  const remove = (id: string) =>
    setData((p) => ({ ...p, rules: p.rules.filter((r) => r.id !== id) }));

  const addNoRepeatSide = () =>
    setData((p) => ({
      ...p,
      rules: [...p.rules, { id: generateId('rule'), type: 'no_repeat_side_category', enabled: true, windowDays: 3 } as PlanRule],
    }));

  const addRequiredCat = () =>
    setData((p) => ({
      ...p,
      rules: [...p.rules, { id: generateId('rule'), type: 'required_category', enabled: true, categoryId: '', categoryType: 'meal', minCount: 1, everyNDays: 7, consecutive: false, consecutiveDays: 2 } as PlanRule],
    }));

  const addNoRecent = () =>
    setData((p) => ({
      ...p,
      rules: [...p.rules, { id: generateId('rule'), type: 'no_recent_meals', enabled: true, recentDays: 14 } as PlanRule],
    }));

  const handleExport = () => exportData(data);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importData(file);
      if (confirm('Ovo će zamijeniti sve trenutne podatke. Nastaviti?')) {
        setData(() => imported);
        alert('Podaci uspješno uvezeni!');
      }
    } catch {
      alert('Greška pri uvozu datoteke!');
    }
    e.target.value = '';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Settings className="text-amber-600" /> Pravila i postavke
      </h1>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Postavke plana</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Trajanje plana (dana)</label>
            <input
              type="number"
              min={1}
              max={30}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={data.settings.planDurationDays}
              onChange={(e) => setData((p) => ({ ...p, settings: { ...p.settings, planDurationDays: Number(e.target.value) } }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ne ponavljaj jelo unutar plana (dana)</label>
            <input
              type="number"
              min={1}
              max={30}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={data.settings.noRepeatWithinPlanDays}
              onChange={(e) => setData((p) => ({ ...p, settings: { ...p.settings, noRepeatWithinPlanDays: Number(e.target.value) } }))}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Pravila generiranja</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={addNoRepeatSide} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
            <Plus size={13} /> Ne ponavljaj vrstu dodatka
          </button>
          <button onClick={addRequiredCat} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
            <Plus size={13} /> Obavezna kategorija
          </button>
          <button onClick={addNoRecent} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
            <Plus size={13} /> Izbjegavaj nedavna jela
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {data.rules.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nema pravila. Dodajte pravila za generiranje plana.</p>
        ) : (
          data.rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} onUpdate={(r) => update(rule.id, r)} onDelete={() => remove(rule.id)} />
          ))
        )}
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Izvoz / Uvoz podataka</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Download size={16} /> Izvezi podatke
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
            <Upload size={16} /> Uvezi podatke
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Svi podaci se čuvaju lokalno u vašem pregledniku. Izvozite redovito kao sigurnosnu kopiju.
        </p>
      </div>
    </div>
  );
}
