import { useState } from 'react';
import { Settings, Plus, Trash2, Pencil, Check, X, Download, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../AppContext';
import type { NoRepeatSideCategoryRule, RequiredCategoryRule, NoRecentMealsRule } from '../types';
import { generateId, exportData, importData } from '../storage';

const DEFAULT_NO_REPEAT: NoRepeatSideCategoryRule = {
  id: 'rule_no_repeat_side',
  type: 'no_repeat_side_category',
  enabled: true,
  windowDays: 3,
};

const DEFAULT_NO_RECENT: NoRecentMealsRule = {
  id: 'rule_no_recent',
  type: 'no_recent_meals',
  enabled: true,
  recentDays: 14,
};

const emptyRequired = (): Omit<RequiredCategoryRule, 'id'> => ({
  type: 'required_category',
  enabled: true,
  categoryId: '',
  categoryType: 'meal',
  minCount: 1,
  everyNDays: 7,
  consecutive: false,
  consecutiveDays: 2,
});

export default function Rules() {
  const { data, setData } = useApp();

  // Singleton rules
  const noRepeatRule: NoRepeatSideCategoryRule =
    (data.rules.find((r) => r.type === 'no_repeat_side_category') as NoRepeatSideCategoryRule | undefined)
    ?? DEFAULT_NO_REPEAT;

  const noRecentRule: NoRecentMealsRule =
    (data.rules.find((r) => r.type === 'no_recent_meals') as NoRecentMealsRule | undefined)
    ?? DEFAULT_NO_RECENT;

  const requiredRules = data.rules.filter((r) => r.type === 'required_category') as RequiredCategoryRule[];

  // Editor state for required categories
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<Omit<RequiredCategoryRule, 'id'>>(emptyRequired());

  const updateSingletonRule = (rule: NoRepeatSideCategoryRule | NoRecentMealsRule) => {
    setData((p) => ({
      ...p,
      rules: p.rules.some((r) => r.type === rule.type)
        ? p.rules.map((r) => r.type === rule.type ? rule : r)
        : [...p.rules, rule],
    }));
  };

  const saveRequired = () => {
    if (!form.categoryId) return;
    setData((p) => {
      if (addingNew) {
        const newRule: RequiredCategoryRule = { ...form, id: generateId('rule') };
        return { ...p, rules: [...p.rules, newRule] };
      }
      return { ...p, rules: p.rules.map((r) => r.id === editingId ? { ...form, id: editingId! } : r) };
    });
    setAddingNew(false);
    setEditingId(null);
  };

  const deleteRequired = (id: string) => {
    setData((p) => ({ ...p, rules: p.rules.filter((r) => r.id !== id) }));
  };

  const startEdit = (rule: RequiredCategoryRule) => {
    setForm({ type: 'required_category', enabled: rule.enabled, categoryId: rule.categoryId, categoryType: rule.categoryType, minCount: rule.minCount, everyNDays: rule.everyNDays, consecutive: rule.consecutive, consecutiveDays: rule.consecutiveDays });
    setEditingId(rule.id);
    setAddingNew(false);
  };

  const startAdd = () => {
    setForm(emptyRequired());
    setAddingNew(true);
    setEditingId(null);
  };

  const cancelEdit = () => { setEditingId(null); setAddingNew(false); };

  const getCategoryName = (r: RequiredCategoryRule) => {
    const cats = r.categoryType === 'meal' ? data.mealCategories : data.sideCategories;
    return cats.find((c) => c.id === r.categoryId)?.name ?? '?';
  };

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

  const FormFields = () => {
    const cats = form.categoryType === 'meal' ? data.mealCategories : data.sideCategories;
    return (
      <div className="space-y-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tip</label>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.categoryType}
              onChange={(e) => setForm({ ...form, categoryType: e.target.value as 'meal' | 'side', categoryId: '' })}>
              <option value="meal">Jelo</option>
              <option value="side">Prilog</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Kategorija *</label>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">-- Odaberi --</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min. puta</label>
            <input type="number" min={1} max={7} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.minCount} onChange={(e) => setForm({ ...form, minCount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Svakih N dana</label>
            <input type="number" min={1} max={14} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.everyNDays} onChange={(e) => setForm({ ...form, everyNDays: Number(e.target.value) })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1">
          <input type="checkbox" checked={form.consecutive} className="accent-amber-600 w-4 h-4"
            onChange={(e) => setForm({ ...form, consecutive: e.target.checked })} />
          Uzastopni dani
          {form.consecutive && (
            <>
              <input type="number" min={2} max={7} className="w-16 border rounded-xl px-2 py-1.5 text-sm bg-white"
                value={form.consecutiveDays} onChange={(e) => setForm({ ...form, consecutiveDays: Number(e.target.value) })} />
              <span className="text-xs text-gray-500">dana zaredom</span>
            </>
          )}
        </label>
        <div className="flex gap-2 pt-1">
          <button onClick={saveRequired} disabled={!form.categoryId}
            className="flex-1 bg-amber-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
            <Check size={16} /> Spremi
          </button>
          <button onClick={cancelEdit} className="flex-1 border py-3 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-1.5">
            <X size={16} /> Odustani
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Settings className="text-amber-600" size={22} /> Pravila i postavke
      </h1>

      {/* Plan settings */}
      <div className="bg-white rounded-xl border p-4 mb-4">
        <p className="font-semibold text-gray-700 mb-3 text-sm">Postavke plana</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Trajanje plana (dana)</label>
            <input type="number" min={1} max={30} className="w-full border rounded-xl px-3 py-2.5 text-sm"
              value={data.settings.planDurationDays}
              onChange={(e) => setData((p) => ({ ...p, settings: { ...p.settings, planDurationDays: Number(e.target.value) } }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Ne ponavljaj u planu (dana)</label>
            <input type="number" min={1} max={30} className="w-full border rounded-xl px-3 py-2.5 text-sm"
              value={data.settings.noRepeatWithinPlanDays}
              onChange={(e) => setData((p) => ({ ...p, settings: { ...p.settings, noRepeatWithinPlanDays: Number(e.target.value) } }))} />
          </div>
        </div>
      </div>

      {/* No repeat side category rule */}
      <div className={`bg-white rounded-xl border p-4 mb-3 ${!noRepeatRule.enabled ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-gray-800 text-sm">Ne ponavljaj vrstu priloga</p>
          <button onClick={() => updateSingletonRule({ ...noRepeatRule, enabled: !noRepeatRule.enabled })}
            className="text-amber-600 flex-shrink-0">
            {noRepeatRule.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-300" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Ista kategorija priloga ne smije se pojaviti unutar N uzastopnih dana.</p>
        {noRepeatRule.enabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Prozor dana:</label>
            <input type="number" min={2} max={14} className="w-20 border rounded-xl px-3 py-2 text-sm"
              value={noRepeatRule.windowDays}
              onChange={(e) => updateSingletonRule({ ...noRepeatRule, windowDays: Number(e.target.value) })} />
          </div>
        )}
      </div>

      {/* No recent meals rule */}
      <div className={`bg-white rounded-xl border p-4 mb-4 ${!noRecentRule.enabled ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-gray-800 text-sm">Izbjegavaj nedavna jela</p>
          <button onClick={() => updateSingletonRule({ ...noRecentRule, enabled: !noRecentRule.enabled })}
            className="text-amber-600 flex-shrink-0">
            {noRecentRule.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-300" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Ne koristi jela koja su bila u planu unutar zadnjeg N dana.</p>
        {noRecentRule.enabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Zadnjih dana:</label>
            <input type="number" min={1} max={60} className="w-20 border rounded-xl px-3 py-2 text-sm"
              value={noRecentRule.recentDays}
              onChange={(e) => updateSingletonRule({ ...noRecentRule, recentDays: Number(e.target.value) })} />
          </div>
        )}
      </div>

      {/* Required categories */}
      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-800 text-sm">Obavezne kategorije</p>
          {!addingNew && editingId === null && (
            <button onClick={startAdd}
              className="flex items-center gap-1.5 text-sm bg-amber-600 text-white px-3 py-2 rounded-xl active:scale-95 transition-transform">
              <Plus size={15} /> Dodaj
            </button>
          )}
        </div>

        {requiredRules.length === 0 && !addingNew && (
          <p className="text-sm text-gray-400 py-2">Nema obaveznih kategorija.</p>
        )}

        <div className="space-y-3">
          {requiredRules.map((rule) => (
            <div key={rule.id}>
              {editingId === rule.id ? (
                <FormFields />
              ) : (
                <div className={`flex items-start justify-between gap-2 rounded-xl border px-4 py-3 ${!rule.enabled ? 'opacity-60' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{getCategoryName(rule)}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {rule.categoryType === 'meal' ? 'Jelo' : 'Prilog'}
                      </span>
                      {!rule.enabled && <span className="text-xs text-gray-400 italic">isključeno</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Min. {rule.minCount}× svakih {rule.everyNDays} dana
                      {rule.consecutive ? `, ${rule.consecutiveDays} dana zaredom` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setData((p) => ({ ...p, rules: p.rules.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r) }))}
                      className="text-amber-500 p-1">
                      {rule.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-gray-300" />}
                    </button>
                    <button onClick={() => startEdit(rule)} className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteRequired(rule.id)} className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg active:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingNew && <FormFields />}
        </div>
      </div>

      {/* Export / Import */}
      <div className="bg-white rounded-xl border p-4">
        <p className="font-semibold text-gray-700 mb-3 text-sm">Izvoz / Uvoz podataka</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm active:scale-95 transition-transform">
            <Download size={16} /> Izvezi
          </button>
          <label className="flex items-center gap-2 px-4 py-3 border rounded-xl hover:bg-gray-50 text-sm cursor-pointer active:scale-95 transition-transform">
            <Upload size={16} /> Uvezi
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Svi podaci se čuvaju u pregledniku. Redovito izvozite kao sigurnosnu kopiju.
        </p>
      </div>
    </div>
  );
}
