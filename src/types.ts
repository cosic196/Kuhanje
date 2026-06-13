export interface MealCategory {
  id: string;
  name: string;
}

export interface SideCategory {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  isCommon: boolean;
}

export interface IngredientAmount {
  ingredientId: string;
  amount: string;
  unit: string;
}

export interface Side {
  id: string;
  name: string;
  ingredients: IngredientAmount[];
  categoryId: string;
  recipe: string;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: IngredientAmount[];
  categoryId: string;
  possibleSideIds: string[];
  recipe: string;
}

export type RuleType =
  | 'no_repeat_side_category'
  | 'no_repeat_meal_category'
  | 'required_category'
  | 'no_recent_meals';

export interface NoRepeatSideCategoryRule {
  id: string;
  type: 'no_repeat_side_category';
  enabled: boolean;
  windowDays: number;
}

export interface NoRepeatMealCategoryRule {
  id: string;
  type: 'no_repeat_meal_category';
  enabled: boolean;
  windowDays: number;
}

export interface RequiredCategoryRule {
  id: string;
  type: 'required_category';
  enabled: boolean;
  categoryId: string;
  categoryType: 'meal' | 'side';
  minCount: number;
  maxCount?: number;
  everyNDays: number;
}

export interface NoRecentMealsRule {
  id: string;
  type: 'no_recent_meals';
  enabled: boolean;
  recentDays: number;
}

export type PlanRule =
  | NoRepeatSideCategoryRule
  | NoRepeatMealCategoryRule
  | RequiredCategoryRule
  | NoRecentMealsRule;

export interface PlanDay {
  date: string;
  mealId: string;
  sideId: string;
  notes: string;
}

export interface Plan {
  id: string;
  name: string;
  startDate: string;
  days: PlanDay[];
  createdAt: string;
}

export interface ShoppingItem {
  ingredientId: string;
  amount: string;
  unit: string;
  checked: boolean;
}

export interface PlanShopping {
  planId: string;
  items: ShoppingItem[];
  commonChecked: Record<string, boolean>;
}

export interface AppData {
  mealCategories: MealCategory[];
  sideCategories: SideCategory[];
  ingredients: Ingredient[];
  sides: Side[];
  meals: Meal[];
  rules: PlanRule[];
  plans: Plan[];
  planShopping: PlanShopping[];
  settings: AppSettings;
}

export interface AppSettings {
  planDurationDays: number;
  noRepeatWithinPlanDays: number;
}
