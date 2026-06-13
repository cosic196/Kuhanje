import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import type { IngredientAmount } from '../types';

interface Props {
  items: IngredientAmount[];
  onChange: (items: IngredientAmount[]) => void;
}

export default function IngredientEditor({ items, onChange }: Props) {
  const { data } = useApp();

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
          <select
            className="flex-1 border rounded-xl px-3 py-2.5 text-sm min-w-0"
            value={item.ingredientId}
            onChange={(e) => update(i, 'ingredientId', e.target.value)}
          >
            <option value="">-- Sastojak --</option>
            {data.ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>{ing.name}</option>
            ))}
          </select>
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
        <Plus size={16} /> Dodaj sastojak
      </button>
    </div>
  );
}
