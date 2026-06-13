import { useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { useApp } from '../AppContext';
import type { IngredientAmount } from '../types';
import { generateId } from '../storage';

function IngredientSearch({ value, onSelect }: { value: string; onSelect: (id: string) => void }) {
  const { data, setData } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const sorted = [...data.ingredients].sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  const selected = data.ingredients.find((i) => i.id === value);
  const filtered = query.trim()
    ? sorted.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : sorted;
  const exactMatch = sorted.some((i) => i.name.toLowerCase() === query.trim().toLowerCase());

  const handleSelect = (id: string) => {
    onSelect(id);
    setQuery('');
    setOpen(false);
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    const id = generateId('ing');
    setData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { id, name, isCommon: false }],
    }));
    onSelect(id);
    setQuery('');
    setOpen(false);
  };

  if (selected) {
    return (
      <div className="flex items-center gap-1.5 flex-1 border rounded-xl px-3 py-2.5 text-sm bg-white min-w-0">
        <span className="flex-1 truncate text-gray-800">{selected.name}</span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect('')}
          className="text-gray-400 hover:text-red-500 flex-shrink-0 p-0.5"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-w-0">
      <div className="flex items-center border rounded-xl px-3 py-2.5 text-sm bg-white gap-1.5 focus-within:ring-2 focus-within:ring-amber-300 focus-within:border-amber-400">
        <Search size={13} className="text-gray-400 flex-shrink-0" />
        <input
          className="flex-1 outline-none min-w-0 bg-transparent placeholder:text-gray-400"
          placeholder="Traži namirnicu..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
        />
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && !query.trim() && (
            <p className="text-sm text-gray-400 px-3 py-3 text-center">Upiši naziv za pretragu ili dodavanje.</p>
          )}
          {filtered.map((ing) => (
            <button
              key={ing.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(ing.id)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              {ing.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              className="w-full text-left px-3 py-2.5 text-sm text-amber-600 hover:bg-amber-50 border-t flex items-center gap-1.5 font-medium"
            >
              <Plus size={14} /> Dodaj novu namirnicu &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function IngredientEditor({ items, onChange }: { items: IngredientAmount[]; onChange: (items: IngredientAmount[]) => void }) {
  const add = () => onChange([...items, { ingredientId: '', amount: '', unit: '' }]);
  const update = (i: number, field: keyof IngredientAmount, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <IngredientSearch
            value={item.ingredientId}
            onSelect={(id) => update(i, 'ingredientId', id)}
          />
          <input
            className="w-16 border rounded-xl px-2 py-2.5 text-sm text-center flex-shrink-0"
            placeholder="Kol."
            value={item.amount}
            onChange={(e) => update(i, 'amount', e.target.value)}
          />
          <input
            className="w-14 border rounded-xl px-2 py-2.5 text-sm text-center flex-shrink-0"
            placeholder="Jed."
            value={item.unit}
            onChange={(e) => update(i, 'unit', e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2.5 text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 py-1"
      >
        <Plus size={16} /> Dodaj namirnicu
      </button>
    </div>
  );
}
