import { useState } from 'react';
import { Plus, Pencil, Trash2, ShoppingBasket, Star, Check, X } from 'lucide-react';
import { useApp } from '../AppContext';
import type { Ingredient } from '../types';
import { generateId } from '../storage';

export default function Ingredients() {
  const { data, setData } = useApp();
  const [newName, setNewName] = useState('');
  const [newIsCommon, setNewIsCommon] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsCommon, setEditIsCommon] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = [...data.ingredients]
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'hr'));

  const common = filtered.filter((i) => i.isCommon);
  const notCommon = filtered.filter((i) => !i.isCommon);

  const add = () => {
    if (!newName.trim()) return;
    setData((p) => ({
      ...p,
      ingredients: [...p.ingredients, { id: generateId('ing'), name: newName.trim(), isCommon: newIsCommon }],
    }));
    setNewName('');
    setNewIsCommon(false);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setData((p) => ({
      ...p,
      ingredients: p.ingredients.map((i) =>
        i.id === editId ? { ...i, name: editName.trim(), isCommon: editIsCommon } : i
      ),
    }));
    setEditId(null);
  };

  const remove = (id: string) => {
    setData((p) => ({ ...p, ingredients: p.ingredients.filter((i) => i.id !== id) }));
  };

  const startEdit = (ing: Ingredient) => {
    setEditId(ing.id);
    setEditName(ing.name);
    setEditIsCommon(ing.isCommon);
  };

  const renderList = (items: typeof filtered, label: string) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 px-1 py-2">Nema namirnica.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((ing) =>
            editId === ing.id ? (
              <div key={ing.id} className="flex gap-2 items-center bg-amber-50 rounded-xl p-2">
                <input
                  className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-white"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null); }}
                />
                <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={editIsCommon}
                    onChange={(e) => setEditIsCommon(e.target.checked)}
                    className="accent-amber-600 w-4 h-4"
                  />
                  Stalna
                </label>
                <button onClick={saveEdit} className="p-2.5 bg-amber-600 text-white rounded-xl flex-shrink-0">
                  <Check size={15} />
                </button>
                <button onClick={() => setEditId(null)} className="p-2.5 border rounded-xl text-gray-500 flex-shrink-0">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div key={ing.id} className="flex items-center justify-between bg-white rounded-xl border px-4 py-3">
                <span className="text-sm text-gray-800">{ing.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(ing)}
                    className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(ing.id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg active:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <ShoppingBasket className="text-amber-600" size={22} /> Namirnice
      </h1>

      {/* Add new */}
      <div className="bg-white rounded-xl border p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Dodaj novu namirnicu</p>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border rounded-xl px-4 py-3 text-sm"
            placeholder="Naziv namirnice..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          />
          <button
            onClick={add}
            disabled={!newName.trim()}
            className="px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={newIsCommon}
            onChange={(e) => setNewIsCommon(e.target.checked)}
            className="accent-amber-600 w-4 h-4"
          />
          <Star size={14} className="text-amber-500" />
          Stalna namirnica (sol, ulje, šećer...)
        </label>
      </div>

      {/* Search + list */}
      <div className="bg-white rounded-xl border p-4">
        <input
          className="w-full border rounded-xl px-4 py-3 text-sm mb-4"
          placeholder="Pretraži namirnice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {renderList(common, '⭐ Stalne namirnice')}
        {renderList(notCommon, 'Ostale namirnice')}
      </div>
    </div>
  );
}
