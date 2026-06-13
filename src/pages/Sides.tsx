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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Dodaci</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm active:scale-95 transition-transform"
        >
          <Plus size={18} /> Dodaj
        </button>
      </div>

      {data.sides.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Layers size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nema dodanih dodataka</p>
          <p className="text-sm mt-1">Dodajte prve dodatke (tjestenina, krumpir...)</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.sides.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {getCategoryName(s.categoryId)}
                    </span>
                    {s.ingredients.length > 0 && (
                      <span className="text-xs text-gray-400">{s.ingredients.length} sast.</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => remove(s.id)} className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg active:bg-red-50">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isNew || editing) && (
        <Modal title={isNew ? 'Novi dodatak' : 'Uredi dodatak'} onClose={close} wide>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv *</label>
              <input
                className="w-full border rounded-xl px-4 py-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Npr. Tjestenina"
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
                {data.sideCategories.map((c) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recept</label>
              <textarea
                className="w-full border rounded-xl px-4 py-3 text-sm min-h-[80px] resize-none"
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
