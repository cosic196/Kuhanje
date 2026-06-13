import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Check, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { useLang } from '../LanguageContext';
import { generateId } from '../storage';

function CategorySection({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
  badgeClass,
  noCatsText,
  newCatPlaceholder,
}: {
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  badgeClass: string;
  noCatsText: string;
  newCatPlaceholder: string;
}) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const commitAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  const commitEdit = () => {
    if (!editName.trim()) return;
    onEdit(editId!, editName.trim());
    setEditId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</h2>

      <div className="space-y-1.5 mb-4">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-1">{noCatsText}</p>
        )}
        {items.map((cat) =>
          editId === cat.id ? (
            <div key={cat.id} className="flex gap-2 items-center">
              <input
                className="flex-1 border dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditId(null);
                }}
              />
              <button onClick={commitEdit} className="p-2.5 bg-amber-600 text-white rounded-xl">
                <Check size={16} />
              </button>
              <button onClick={() => setEditId(null)} className="p-2.5 border dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div key={cat.id} className="flex items-center justify-between gap-2 py-1">
              <span className={`text-sm px-2.5 py-1 rounded-full ${badgeClass}`}>{cat.name}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                  className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-amber-600 rounded-lg active:bg-amber-50 dark:active:bg-amber-900/30"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(cat.id)}
                  className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-500 rounded-lg active:bg-red-50 dark:active:bg-red-950/30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
          placeholder={newCatPlaceholder}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); }}
        />
        <button
          onClick={commitAdd}
          disabled={!newName.trim()}
          className="px-4 py-2.5 bg-amber-600 text-white text-sm rounded-xl hover:bg-amber-700 disabled:opacity-40 flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Categories() {
  const { data, setData } = useApp();
  const { t } = useLang();

  const addMealCat = (name: string) =>
    setData((p) => ({ ...p, mealCategories: [...p.mealCategories, { id: generateId('mc'), name }] }));
  const editMealCat = (id: string, name: string) =>
    setData((p) => ({ ...p, mealCategories: p.mealCategories.map((c) => c.id === id ? { ...c, name } : c) }));
  const deleteMealCat = (id: string) =>
    setData((p) => ({ ...p, mealCategories: p.mealCategories.filter((c) => c.id !== id) }));

  const addSideCat = (name: string) =>
    setData((p) => ({ ...p, sideCategories: [...p.sideCategories, { id: generateId('sc'), name }] }));
  const editSideCat = (id: string, name: string) =>
    setData((p) => ({ ...p, sideCategories: p.sideCategories.map((c) => c.id === id ? { ...c, name } : c) }));
  const deleteSideCat = (id: string) =>
    setData((p) => ({ ...p, sideCategories: p.sideCategories.filter((c) => c.id !== id) }));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
        <Tag className="text-amber-600" size={22} /> {t.categories.title}
      </h1>
      <div className="space-y-4">
        <CategorySection
          title={t.categories.mealCats}
          items={[...data.mealCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'))}
          onAdd={addMealCat}
          onEdit={editMealCat}
          onDelete={deleteMealCat}
          badgeClass="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50"
          noCatsText={t.categories.noCats}
          newCatPlaceholder={t.categories.newCatPlaceholder}
        />
        <CategorySection
          title={t.categories.sideCats}
          items={[...data.sideCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'))}
          onAdd={addSideCat}
          onEdit={editSideCat}
          onDelete={deleteSideCat}
          badgeClass="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50"
          noCatsText={t.categories.noCats}
          newCatPlaceholder={t.categories.newCatPlaceholder}
        />
      </div>
    </div>
  );
}
