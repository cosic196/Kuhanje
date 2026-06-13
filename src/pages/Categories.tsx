import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Check, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { generateId } from '../storage';

function CategorySection({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
  badgeClass,
}: {
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  badgeClass: string;
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
    <div className="bg-white rounded-xl border p-4">
      <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>

      <div className="space-y-1.5 mb-4">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 py-1">Nema kategorija.</p>
        )}
        {items.map((cat) =>
          editId === cat.id ? (
            <div key={cat.id} className="flex gap-2 items-center">
              <input
                className="flex-1 border rounded-xl px-3 py-2.5 text-sm"
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
              <button onClick={() => setEditId(null)} className="p-2.5 border rounded-xl text-gray-500">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div key={cat.id} className="flex items-center justify-between gap-2 py-1">
              <span className={`text-sm px-2.5 py-1 rounded-full ${badgeClass}`}>{cat.name}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                  className="p-2.5 text-gray-400 hover:text-amber-600 rounded-lg active:bg-amber-50"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(cat.id)}
                  className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg active:bg-red-50"
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
          className="flex-1 border rounded-xl px-3 py-2.5 text-sm"
          placeholder="Nova kategorija..."
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
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Tag className="text-amber-600" size={22} /> Kategorije
      </h1>
      <div className="space-y-4">
        <CategorySection
          title="Kategorije jela"
          items={[...data.mealCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'))}
          onAdd={addMealCat}
          onEdit={editMealCat}
          onDelete={deleteMealCat}
          badgeClass="text-amber-700 bg-amber-50"
        />
        <CategorySection
          title="Kategorije priloga"
          items={[...data.sideCategories].sort((a, b) => a.name.localeCompare(b.name, 'hr'))}
          onAdd={addSideCat}
          onEdit={editSideCat}
          onDelete={deleteSideCat}
          badgeClass="text-blue-700 bg-blue-50"
        />
      </div>
    </div>
  );
}
