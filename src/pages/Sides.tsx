import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const resetInline = () => { setShowNewCat(false); setNewCatName(''); };
  const openNew = () => { setForm(empty()); setEditing(null); setIsNew(true); resetInline(); };
  const openEdit = (s: Side) => {
    setForm({ name: s.name, ingredients: s.ingredients, categoryId: s.categoryId, recipe: s.recipe });
    setEditing(s);
    setIsNew(false);
    resetInline();
  };
  const close = () => { setEditing(null); setIsNew(false); resetInline(); };

  const save = () => {
    if (!form.name.trim()) return;
    setData((prev) => {
      if (isNew) return { ...prev, sides: [...prev.sides, { ...form, id: generateId('side') }] };
      return { ...prev, sides: prev.sides.map((s) => s.id === editing!.id ? { ...editing!, ...form } : s) };
    });
    close();
  };

  const remove = (id: string) => {
    if (!confirm('Obrisati ovaj prilog?')) return;
    setData((prev) => ({ ...prev, sides: prev.sides.filter((s) => s.id !== id) }));
  };

  const createCategory = () => {
    if (!newCatName.trim()) return;
    const id = generateId('sc');
    setData((prev) => ({
      ...prev,
      sideCategories: [...prev.sideCategories, { id, name: newCatName.trim() }],
    }));
    setForm((f) => ({ ...f, categoryId: id }));
    setNewCatName('');
    setShowNewCat(false);
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCat = (id: string) =>
    setCollapsedCats((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const getCategoryName = (id: string) =>
    data.sideCategories.find((c) => c.id === id)?.name ?? 'Ostalo';
  const getIngredientName = (id: string) =>
    data.ingredients.find((i) => i.id === id)?.name ?? '?';

  const sortedSides = [...data.sides].sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  const sortedCategories = [...data.sideCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Prilozi</h1>
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
          <p className="font-medium">Nema dodanih priloga</p>
          <p className="text-sm mt-1">Dodajte prve priloge (tjestenina, krumpir...)</p>
        </div>
      ) : (() => {
        const groups = sortedCategories
          .map((cat) => ({ cat, items: sortedSides.filter((s) => s.categoryId === cat.id) }))
          .filter(({ items }) => items.length > 0);
        const orphans = sortedSides.filter((s) => !data.sideCategories.some((c) => c.id === s.categoryId));
        if (orphans.length > 0) groups.push({ cat: { id: '__other', name: 'Ostalo' }, items: orphans });

        return (
          <div className="space-y-4">
            {groups.map(({ cat, items }) => {
              const collapsed = collapsedCats.has(cat.id);
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCat(cat.id)}
                    className="w-full flex items-center gap-2 mb-2 group"
                  >
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">{cat.name}</span>
                    <span className="text-xs text-gray-400 font-normal">({items.length})</span>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400">
                      {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </span>
                  </button>
                  {!collapsed && (
                    <div className="space-y-2">
                      {items.map((s) => {
                        const expanded = expandedIds.has(s.id);
                        return (
                          <div key={s.id} className="bg-white rounded-xl border overflow-hidden">
                            <div
                              className="flex items-center gap-3 p-4 cursor-pointer select-none"
                              onClick={() => toggleExpand(s.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{s.name}</p>
                                {s.ingredients.length > 0 && (
                                  <span className="text-xs text-gray-400 mt-1 block">{s.ingredients.length} nam.</span>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0 items-center">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                                  className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50"
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                                  className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg active:bg-red-50"
                                >
                                  <Trash2 size={17} />
                                </button>
                                <span className="text-gray-300 ml-1">
                                  {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                                </span>
                              </div>
                            </div>
                            {expanded && (
                              <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                                {s.ingredients.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Namirnice</p>
                                    <ul className="space-y-1">
                                      {s.ingredients.map((ing, i) => (
                                        <li key={i} className="flex justify-between text-sm text-gray-700">
                                          <span>{getIngredientName(ing.ingredientId)}</span>
                                          {(ing.amount || ing.unit) && (
                                            <span className="text-gray-400 ml-4 flex-shrink-0">{ing.amount} {ing.unit}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {s.recipe && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recept</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{s.recipe}</p>
                                  </div>
                                )}
                                {s.ingredients.length === 0 && !s.recipe && (
                                  <p className="text-sm text-gray-400">Nema dodatnih detalja.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {(isNew || editing) && (
        <Modal title={isNew ? 'Novi prilog' : 'Uredi prilog'} onClose={close} wide>
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
              <div className="flex gap-2">
                <select
                  className="flex-1 border rounded-xl px-4 py-3"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  {sortedCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {!showNewCat && (
                  <button
                    type="button"
                    onClick={() => setShowNewCat(true)}
                    className="px-3 py-2.5 border rounded-xl text-amber-600 hover:bg-amber-50 text-sm font-medium flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus size={14} /> Nova
                  </button>
                )}
              </div>
              {showNewCat && (
                <div className="flex gap-2 mt-2">
                  <input
                    className="flex-1 border rounded-xl px-3 py-2.5 text-sm"
                    placeholder="Naziv kategorije..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') createCategory(); if (e.key === 'Escape') { setShowNewCat(false); setNewCatName(''); } }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    disabled={!newCatName.trim()}
                    className="p-2.5 bg-amber-600 text-white rounded-xl disabled:opacity-40 flex-shrink-0"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCat(false); setNewCatName(''); }}
                    className="p-2.5 border rounded-xl text-gray-500 flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Namirnice</label>
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
