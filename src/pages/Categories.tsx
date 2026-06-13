import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useApp } from '../AppContext';
import { generateId } from '../storage';

function CategorySection({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
  color,
}: {
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  color: string;
}) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-2 mb-4">
        {items.map((cat) =>
          editId === cat.id ? (
            <div key={cat.id} className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editName.trim()) {
                    onEdit(cat.id, editName.trim());
                    setEditId(null);
                  }
                  if (e.key === 'Escape') setEditId(null);
                }}
                autoFocus
              />
              <button
                onClick={() => { if (editName.trim()) { onEdit(cat.id, editName.trim()); setEditId(null); } }}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
              >
                Spremi
              </button>
              <button
                onClick={() => setEditId(null)}
                className="px-3 py-1.5 border text-sm rounded-lg hover:bg-gray-50"
              >
                Odustani
              </button>
            </div>
          ) : (
            <div key={cat.id} className="flex items-center justify-between group">
              <span className={`text-sm px-2 py-0.5 rounded-full ${color}`}>{cat.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                  className="p-1 text-gray-400 hover:text-amber-600"
                >
                  <Pencil size={14} />
                </button>
                <button onClick={() => onDelete(cat.id)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
          placeholder="Nova kategorija..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim()) {
              onAdd(newName.trim());
              setNewName('');
            }
          }}
        />
        <button
          onClick={() => { if (newName.trim()) { onAdd(newName.trim()); setNewName(''); } }}
          className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 flex items-center gap-1"
        >
          <Plus size={15} /> Dodaj
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
  const deleteMealCat = (id: string) => {
    if (!confirm('Obrisati ovu kategoriju?')) return;
    setData((p) => ({ ...p, mealCategories: p.mealCategories.filter((c) => c.id !== id) }));
  };

  const addSideCat = (name: string) =>
    setData((p) => ({ ...p, sideCategories: [...p.sideCategories, { id: generateId('sc'), name }] }));
  const editSideCat = (id: string, name: string) =>
    setData((p) => ({ ...p, sideCategories: p.sideCategories.map((c) => c.id === id ? { ...c, name } : c) }));
  const deleteSideCat = (id: string) => {
    if (!confirm('Obrisati ovu kategoriju?')) return;
    setData((p) => ({ ...p, sideCategories: p.sideCategories.filter((c) => c.id !== id) }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Tag className="text-amber-600" /> Kategorije
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CategorySection
          title="Kategorije jela"
          items={data.mealCategories}
          onAdd={addMealCat}
          onEdit={editMealCat}
          onDelete={deleteMealCat}
          color="text-amber-700 bg-amber-50"
        />
        <CategorySection
          title="Kategorije dodataka"
          items={data.sideCategories}
          onAdd={addSideCat}
          onEdit={editSideCat}
          onDelete={deleteSideCat}
          color="text-blue-700 bg-blue-50"
        />
      </div>
    </div>
  );
}
