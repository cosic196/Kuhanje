import { useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { useLang } from '../LanguageContext';
import type { IngredientAmount } from '../types';
import { generateId } from '../storage';

function IngredientSearch({ value, onSelect }: { value: string; onSelect: (id: string) => void }) {
  const { data, setData } = useApp();
  const { t } = useLang();
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
      <div className="flex items-center gap-1.5 flex-1 border dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 min-w-0">
        <span className="flex-1 truncate text-gray-800 dark:text-gray-100">{selected.name}</span>
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
      <div className="flex items-center border dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 gap-1.5 focus-within:ring-2 focus-within:ring-amber-300 focus-within:border-amber-400">
        <Search size={13} className="text-gray-400 flex-shrink-0" />
        <input
          className="flex-1 outline-none min-w-0 bg-transparent placeholder:text-gray-400 dark:text-gray-100"
          placeholder={t.ingredientEditor.searchPlaceholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
        />
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && !query.trim() && (
            <p className="text-sm text-gray-400 px-3 py-3 text-center">{t.ingredientEditor.emptyMessage}</p>
          )}
          {filtered.map((ing) => (
            <button
              key={ing.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(ing.id)}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              {ing.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              className="w-full text-left px-3 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 border-t dark:border-gray-700 flex items-center gap-1.5 font-medium"
            >
              <Plus size={14} /> {t.ingredientEditor.addNewIngredient(query.trim())}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function IngredientEditor({ items, onChange }: { items: IngredientAmount[]; onChange: (items: IngredientAmount[]) => void }) {
  const { t } = useLang();
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
            className="w-16 border dark:border-gray-600 rounded-xl px-2 py-2.5 text-sm text-center flex-shrink-0 bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder={t.ingredientEditor.amountPlaceholder}
            value={item.amount}
            onChange={(e) => update(i, 'amount', e.target.value)}
          />
          <input
            className="w-14 border dark:border-gray-600 rounded-xl px-2 py-2.5 text-sm text-center flex-shrink-0 bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder={t.ingredientEditor.unitPlaceholder}
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
        <Plus size={16} /> {t.ingredientEditor.addIngredient}
      </button>
    </div>
  );
}
