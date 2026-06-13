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

  const openNew = () => {
    setForm(empty());
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (m: Meal) => {
    setForm({ name: m.name, ingredients: m.ingredients, categoryId: m.categoryId, possibleSideIds: m.possibleSideIds, recipe: m.recipe });
    setEditing(m);
    setIsNew(false);
  };

  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!form.name.trim()) return;
    setData((prev) => {
      if (isNew) {
        return { ...prev, meals: [...prev.meals, { ...form, id: generateId('meal') }] };
      }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ChefHat className="text-amber-600" /> Jela
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium"
        >
          <Plus size={18} /> Dodaj jelo
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm"
          placeholder="Pretraži jela..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nema jela. Dodajte prvo jelo!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{m.name}</h3>
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {getCategoryName(m.categoryId)}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {m.ingredients.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {m.ingredients.length} sastojak(a)
                </p>
              )}
              {m.possibleSideIds.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Dodaci: {m.possibleSideIds.map((sid) => data.sides.find((s) => s.id === sid)?.name).filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {(isNew || editing) && (
        <Modal title={isNew ? 'Novo jelo' : 'Uredi jelo'} onClose={close} wide>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naziv *</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Npr. Grah s kobasicom"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {data.mealCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sastojci *</label>
              <IngredientEditor
                items={form.ingredients}
                onChange={(items) => setForm({ ...form, ingredients: items })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mogući dodaci</label>
              {data.sides.length === 0 ? (
                <p className="text-sm text-gray-400">Nema dodanih dodataka.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {data.sides.map((side) => (
                    <label key={side.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.possibleSideIds.includes(side.id)}
                        onChange={() => toggleSide(side.id)}
                        className="accent-amber-600"
                      />
                      {side.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recept</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
                value={form.recipe}
                onChange={(e) => setForm({ ...form, recipe: e.target.value })}
                placeholder="Upute za pripremu..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium"
              >
                Spremi
              </button>
              <button onClick={close} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">
                Odustani
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
