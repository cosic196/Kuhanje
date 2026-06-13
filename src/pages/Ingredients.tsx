import { useState } from 'react';
import { Plus, Pencil, Trash2, ShoppingBasket, Star } from 'lucide-react';
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

  const filtered = data.ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

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

  const save = () => {
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
    if (!confirm('Obrisati ovaj sastojak?')) return;
    setData((p) => ({ ...p, ingredients: p.ingredients.filter((i) => i.id !== id) }));
  };

  const startEdit = (ing: Ingredient) => {
    setEditId(ing.id);
    setEditName(ing.name);
    setEditIsCommon(ing.isCommon);
  };

  const renderList = (items: typeof filtered, label: string, badgeClass: string) => (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Nema sastojaka u ovoj kategoriji.</p>
      ) : (
        <div className="space-y-1">
          {items.map((ing) =>
            editId === ing.id ? (
              <div key={ing.id} className="flex gap-2 items-center bg-amber-50 rounded-lg p-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditId(null); }}
                />
                <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={editIsCommon}
                    onChange={(e) => setEditIsCommon(e.target.checked)}
                    className="accent-amber-600"
                  />
                  Zajednički
                </label>
                <button onClick={save} className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">Spremi</button>
                <button onClick={() => setEditId(null)} className="px-3 py-1.5 border text-sm rounded-lg hover:bg-gray-50">Odustani</button>
              </div>
            ) : (
              <div key={ing.id} className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-gray-50">
                <span className="text-sm flex items-center gap-2">
                  {ing.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${badgeClass}`}>{ing.isCommon ? 'Zajednički' : 'Ostalo'}</span>
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => startEdit(ing)} className="p-1 text-gray-400 hover:text-amber-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(ing.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
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
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <ShoppingBasket className="text-amber-600" /> Sastojci
      </h1>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Dodaj novi sastojak</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm min-w-40"
            placeholder="Naziv sastojka..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={newIsCommon}
              onChange={(e) => setNewIsCommon(e.target.checked)}
              className="accent-amber-600"
            />
            <Star size={14} className="text-amber-500" />
            Zajednički sastojak
          </label>
          <button
            onClick={add}
            disabled={!newName.trim()}
            className="flex items-center gap-1 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
          >
            <Plus size={16} /> Dodaj
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Zajednički sastojci (sol, ulje, šećer...) uvijek su u popisu za kupovinu.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
          placeholder="Pretraži sastojke..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {renderList(common, '⭐ Zajednički sastojci', 'text-amber-700 bg-amber-50')}
        {renderList(notCommon, 'Ostali sastojci', 'text-gray-500 bg-gray-100')}
      </div>
    </div>
  );
}
