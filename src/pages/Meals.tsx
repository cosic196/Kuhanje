import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChefHat, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
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

  // inline category creation
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // inline prilog creation
  const [showNewSide, setShowNewSide] = useState(false);
  const [newSideName, setNewSideName] = useState('');
  const [newSideCatId, setNewSideCatId] = useState('sc_ostalo');
  const [showNewSideCat, setShowNewSideCat] = useState(false);
  const [newSideCatName, setNewSideCatName] = useState('');

  const sortedMeals = [...data.meals].sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  const filtered = sortedMeals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const sortedCategories = [...data.mealCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  const sortedSideCategories = [...data.sideCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  const sortedSides = [...data.sides].sort((a, b) => a.name.localeCompare(b.name, 'hr'));

  const resetInline = () => {
    setShowNewCat(false);
    setNewCatName('');
    setShowNewSide(false);
    setNewSideName('');
    setNewSideCatId('sc_ostalo');
    setShowNewSideCat(false);
    setNewSideCatName('');
  };

  const openNew = () => { setForm(empty()); setEditing(null); setIsNew(true); resetInline(); };
  const openEdit = (m: Meal) => {
    setForm({ name: m.name, ingredients: m.ingredients, categoryId: m.categoryId, possibleSideIds: m.possibleSideIds, recipe: m.recipe });
    setEditing(m);
    setIsNew(false);
    resetInline();
  };
  const close = () => { setEditing(null); setIsNew(false); resetInline(); };

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

  const createCategory = () => {
    if (!newCatName.trim()) return;
    const id = generateId('mc');
    setData((prev) => ({
      ...prev,
      mealCategories: [...prev.mealCategories, { id, name: newCatName.trim() }],
    }));
    setForm((f) => ({ ...f, categoryId: id }));
    setNewCatName('');
    setShowNewCat(false);
  };

  const createSide = () => {
    if (!newSideName.trim()) return;
    const id = generateId('side');
    setData((prev) => ({
      ...prev,
      sides: [...prev.sides, { id, name: newSideName.trim(), ingredients: [], categoryId: newSideCatId, recipe: '' }],
    }));
    setForm((f) => ({ ...f, possibleSideIds: [...f.possibleSideIds, id] }));
    setNewSideName('');
    setShowNewSide(false);
    setShowNewSideCat(false);
    setNewSideCatName('');
  };

  const createSideCategory = () => {
    if (!newSideCatName.trim()) return;
    const id = generateId('sc');
    setData((prev) => ({
      ...prev,
      sideCategories: [...prev.sideCategories, { id, name: newSideCatName.trim() }],
    }));
    setNewSideCatId(id);
    setNewSideCatName('');
    setShowNewSideCat(false);
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const getCategoryName = (id: string) =>
    data.mealCategories.find((c) => c.id === id)?.name ?? 'Ostalo';
  const getIngredientName = (id: string) =>
    data.ingredients.find((i) => i.id === id)?.name ?? '?';
  const getSideName = (id: string) =>
    data.sides.find((s) => s.id === id)?.name ?? '?';

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
          {filtered.map((m) => {
            const expanded = expandedIds.has(m.id);
            return (
              <div key={m.id} className="bg-white rounded-xl border overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(m.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {getCategoryName(m.categoryId)}
                      </span>
                      {m.ingredients.length > 0 && (
                        <span className="text-xs text-gray-400">{m.ingredients.length} nam.</span>
                      )}
                      {m.possibleSideIds.length > 0 && (
                        <span className="text-xs text-gray-400">{m.possibleSideIds.length} pril.</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                      className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(m.id); }}
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
                    {m.ingredients.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Namirnice</p>
                        <ul className="space-y-1">
                          {m.ingredients.map((ing, i) => (
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
                    {m.possibleSideIds.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mogući prilozi</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.possibleSideIds.map((id) => (
                            <span key={id} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                              {getSideName(id)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.recipe && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recept</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{m.recipe}</p>
                      </div>
                    )}
                    {m.ingredients.length === 0 && m.possibleSideIds.length === 0 && !m.recipe && (
                      <p className="text-sm text-gray-400">Nema dodatnih detalja.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mogući prilozi</label>
              {sortedSides.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto border rounded-xl p-3 mb-2">
                  {sortedSides.map((side) => (
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
              {sortedSides.length === 0 && !showNewSide && (
                <p className="text-sm text-gray-400 mb-2">Nema dodanih priloga.</p>
              )}
              {showNewSide ? (
                <div className="border rounded-xl p-3 bg-amber-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Novi prilog</p>
                  <input
                    className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
                    placeholder="Naziv priloga (npr. Tjestenina)..."
                    value={newSideName}
                    onChange={(e) => setNewSideName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') createSide(); if (e.key === 'Escape') { setShowNewSide(false); setNewSideName(''); } }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-white"
                      value={newSideCatId}
                      onChange={(e) => setNewSideCatId(e.target.value)}
                    >
                      {sortedSideCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {!showNewSideCat && (
                      <button
                        type="button"
                        onClick={() => setShowNewSideCat(true)}
                        className="px-3 py-2.5 border rounded-xl text-amber-600 hover:bg-amber-50 text-sm font-medium flex items-center gap-1 flex-shrink-0 bg-white"
                      >
                        <Plus size={14} /> Nova
                      </button>
                    )}
                  </div>
                  {showNewSideCat && (
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-white"
                        placeholder="Naziv kategorije..."
                        value={newSideCatName}
                        onChange={(e) => setNewSideCatName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createSideCategory(); if (e.key === 'Escape') { setShowNewSideCat(false); setNewSideCatName(''); } }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={createSideCategory}
                        disabled={!newSideCatName.trim()}
                        className="p-2.5 bg-amber-600 text-white rounded-xl disabled:opacity-40 flex-shrink-0"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNewSideCat(false); setNewSideCatName(''); }}
                        className="p-2.5 border rounded-xl text-gray-500 flex-shrink-0 bg-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={createSide}
                      disabled={!newSideName.trim()}
                      className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform"
                    >
                      Dodaj i označi
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewSide(false); setNewSideName(''); setShowNewSideCat(false); setNewSideCatName(''); }}
                      className="px-4 border rounded-xl text-gray-600 text-sm"
                    >
                      Otkaži
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewSide(true)}
                  className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 py-1"
                >
                  <Plus size={14} /> Dodaj novi prilog
                </button>
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
