import type { AppData } from './types';

const STORAGE_KEY = 'kuhanje_data';

export const defaultData: AppData = {
  mealCategories: [
    { id: 'mc_varivo', name: 'Varivo' },
    { id: 'mc_pecenje', name: 'Pečenje' },
    { id: 'mc_juha', name: 'Juha' },
    { id: 'mc_ostalo', name: 'Ostalo' },
  ],
  sideCategories: [
    { id: 'sc_tjestenina', name: 'Tjestenina' },
    { id: 'sc_krumpir', name: 'Krumpir' },
    { id: 'sc_rice', name: 'Riža' },
    { id: 'sc_salata', name: 'Salata' },
    { id: 'sc_ostalo', name: 'Ostalo' },
  ],
  ingredients: [
    { id: 'ing_sol', name: 'Sol', isCommon: true },
    { id: 'ing_papar', name: 'Papar', isCommon: true },
    { id: 'ing_ulje', name: 'Ulje', isCommon: true },
    { id: 'ing_luk', name: 'Luk', isCommon: false },
    { id: 'ing_cesnjak', name: 'Češnjak', isCommon: true },
    { id: 'ing_rajcica_konzervirana', name: 'Rajčica konzervirana', isCommon: true },
    { id: 'ing_bujta', name: 'Vegeta', isCommon: true },
  ],
  sides: [],
  meals: [],
  rules: [
    {
      id: 'rule_no_repeat_side',
      type: 'no_repeat_side_category',
      enabled: true,
      windowDays: 3,
    },
    {
      id: 'rule_no_repeat_meal',
      type: 'no_repeat_meal_category',
      enabled: false,
      windowDays: 2,
    },
    {
      id: 'rule_no_recent',
      type: 'no_recent_meals',
      enabled: true,
      recentDays: 14,
    },
    {
      id: 'rule_stew',
      type: 'required_category',
      enabled: true,
      categoryId: 'mc_varivo',
      categoryType: 'meal',
      minCount: 1,
      maxCount: 2,
      everyNDays: 7,
    },
  ],
  plans: [],
  planShopping: [],
  settings: {
    planDurationDays: 14,
    noRepeatWithinPlanDays: 14,
  },
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaultData,
      ...parsed,
      mealCategories: parsed.mealCategories ?? defaultData.mealCategories,
      sideCategories: parsed.sideCategories ?? defaultData.sideCategories,
      ingredients: parsed.ingredients ?? defaultData.ingredients,
      sides: parsed.sides ?? defaultData.sides,
      meals: parsed.meals ?? defaultData.meals,
      rules: parsed.rules ?? defaultData.rules,
      plans: parsed.plans ?? defaultData.plans,
      planShopping: parsed.planShopping ?? defaultData.planShopping,
      settings: parsed.settings ?? defaultData.settings,
    };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kuhanje_izvoz_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as AppData;
        resolve(parsed);
      } catch {
        reject(new Error('Neispravan format datoteke'));
      }
    };
    reader.onerror = () => reject(new Error('Greška pri čitanju datoteke'));
    reader.readAsText(file);
  });
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
