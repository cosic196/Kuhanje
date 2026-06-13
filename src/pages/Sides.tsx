import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { useApp } from '../AppContext';
import Modal from '../components/Modal';
import IngredientEditor from '../components/IngredientEditor';
import type { Side } from '../types';
import { generateId } from '../storage';

const empty = (): Omit<Side, 'id'> => ({
  name: '',
  ingredients: [],
  categoryId: 'sc_ostalo',
  recipe: '',
});

export default function Sides() {
  const { data, setData } = useApp();
  const [editing, setEditing] = useState<Side | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(empty());

  const openNew = () => { setForm(empty()); setEditing(null); setIsNew(true); };
  const openEdit = (s: Side) => {
    setForm({ name: s.name, ingredients: s.ingredients, categoryId: s.categoryId, recipe: s.recipe });
    setEditing(s);
    setIsNew(false);
  };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!form.name.trim()) return;
    setData((prev) => {
      if (isNew) return { ...prev, sides: [...prev.sides, { ...form, id: generateId('side') }] };
      return { ...prev, sides: prev.sides.map((s) => s.id === editing!.id ? { ...editing!, ...form } : s) };
    });
    close();
  };

  const remove = (id: string) => {
    if (!confirm('Obrisati ovaj dodatak?')) return;
    setData((prev) => ({ ...prev, sides: prev.sides.filter((s) => s.id !== id) }));
  };

  const getCategoryName = (id: string) =>
    data.sideCategories.find((c) => c.id === id)?.name ?? 'Ostalo';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-amber-600" /> Dodaci
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium"
        >
          <Plus size={18} /> Dodaj dodatak
        </button>
      </div>

      {data.sides.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Layers size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nema dodanih dodataka.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.sides.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{s.name}</h3>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {getCategoryName(s.categoryId)}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {s.ingredients.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">{s.ingredients.length} sastojak(a)</p>
              )}
            </div>
          ))}
        </div>
      )}

      {(isNew || editing) && (
        <Modal title={isNew ? 'Novi dodatak' : 'Uredi dodatak'} onClose={close} wide>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naziv *</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Npr. Tjestenina"
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
                {data.sideCategories.map((c) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Recept</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
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
