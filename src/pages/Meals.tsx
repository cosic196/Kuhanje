import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChefHat } from 'lucide-react';
import { useApp } from '../AppContext';
import Modal from '../components/Modal';
import IngredientEditor from '../components/IngredientEditor';
import type { Meal } from '../types';
import { generateId } from '../storage';

const empty = (): Omit<Meal, 'id'> => ({
  name: '',
  ingredients: [],
  categoryId: 'mc_ostalo',
  possibleSideIds: [],
  recipe: '',
});

export default function Meals() {
  const { data, setData } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Meal | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(empty());

  const filtered = data.meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setForm(empty()); setEditing(null); setIsNew(true); };
  const openEdit = (m: Meal) => {
    setForm({ name: m.name, ingredients: m.ingredients, categoryId: m.categoryId, possibleSideIds: m.possibleSideIds, recipe: m.recipe });
    setEditing(m);
    setIsNew(false);
  };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!form.name.trim()) return;
    setData((prev) => {
      if (isNew) return { ...prev, meals: [...prev.meals, { ...form, id: generateId('meal') }] };
      return { ...prev, meals: prev.meals.map((m) => m.id === editing!.id ? { ...editing!, ...form } : m) };
    });
    close();
  };

  const remove = (id: string) => {
    if (!confirm('Obrisati ovo jelo?')) return;
    setData((prev) => ({ ...prev, meals: prev.meals.filter((m) => m.id !== id) }));
  };

  const toggleSide = (sideId: string) => {
    setForm((f) => ({
      ...f,
      possibleSideIds: f.possibleSideIds.includes(sideId)
        ? f.possibleSideIds.filter((s) => s !== sideId)
        : [...f.possibleSideIds, sideId],
    }));
  };

  const getCategoryName = (id: string) =>
    data.mealCategories.find((c) => c.id === id)?.name ?? 'Ostalo';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Jela</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm active:scale-95 transition-transform"
        >
          <Plus size={18} /> Dodaj
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border rounded-xl pl-10 pr-4 py-3 bg-white"
          placeholder="Pretraži jela..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nema jela</p>
          <p className="text-sm mt-1">Dodajte prvo jelo!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {getCategoryName(m.categoryId)}
                    </span>
                    {m.ingredients.length > 0 && (
                      <span className="text-xs text-gray-400">{m.ingredients.length} sast.</span>
                    )}
                    {m.possibleSideIds.length > 0 && (
                      <span className="text-xs text-gray-400">{m.possibleSideIds.length} dod.</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => remove(m.id)} className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg active:bg-red-50">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isNew || editing) && (
        <Modal title={isNew ? 'Novo jelo' : 'Uredi jelo'} onClose={close} wide>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv *</label>
              <input
                className="w-full border rounded-xl px-4 py-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Npr. Grah s kobasicom"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategorija</label>
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {data.mealCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sastojci</label>
              <IngredientEditor
                items={form.ingredients}
                onChange={(items) => setForm({ ...form, ingredients: items })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mogući dodaci</label>
              {data.sides.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">Nema dodanih dodataka.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto border rounded-xl p-3">
                  {data.sides.map((side) => (
                    <label key={side.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={form.possibleSideIds.includes(side.id)}
                        onChange={() => toggleSide(side.id)}
                        className="accent-amber-600 w-4 h-4"
                      />
                      <span className="truncate">{side.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recept</label>
              <textarea
                className="w-full border rounded-xl px-4 py-3 text-sm min-h-[100px] resize-none"
                value={form.recipe}
                onChange={(e) => setForm({ ...form, recipe: e.target.value })}
                placeholder="Upute za pripremu..."
              />
            </div>
            <button
              onClick={save}
              disabled={!form.name.trim()}
              className="w-full bg-amber-600 text-white py-3.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 font-medium text-base active:scale-95 transition-transform"
            >
              Spremi
            </button>
            <button onClick={close} className="w-full border py-3.5 rounded-xl font-medium text-gray-600">
              Odustani
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
