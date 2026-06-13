import type {
  AppData,
  Plan,
  PlanDay,
  Meal,
  Side,
  NoRepeatSideCategoryRule,
  RequiredCategoryRule,
} from './types';
import { generateId } from './storage';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRecentMealIds(data: AppData, recentDays: number): Set<string> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - recentDays);
  const recentIds = new Set<string>();

  for (const plan of data.plans) {
    for (const day of plan.days) {
      const d = new Date(day.date);
      if (d >= cutoff) {
        recentIds.add(day.mealId);
      }
    }
  }
  return recentIds;
}

function getSideCategoryForDay(
  days: PlanDay[],
  sides: Side[],
  dayIndex: number
): string | null {
  if (dayIndex < 0 || dayIndex >= days.length) return null;
  const sideId = days[dayIndex].sideId;
  if (!sideId) return null;
  const side = sides.find((s) => s.id === sideId);
  return side?.categoryId ?? null;
}

function pickSide(
  meal: Meal,
  sides: Side[],
  days: PlanDay[],
  dayIndex: number,
  noRepeatRule: NoRepeatSideCategoryRule | null
): Side | null {
  if (meal.possibleSideIds.length === 0) return null;

  const available = sides.filter((s) => meal.possibleSideIds.includes(s.id));
  if (available.length === 0) return null;

  if (!noRepeatRule || !noRepeatRule.enabled) {
    return shuffle(available)[0];
  }

  const windowDays = noRepeatRule.windowDays;
  const recentCategories = new Set<string>();
  for (let i = Math.max(0, dayIndex - (windowDays - 1)); i < dayIndex; i++) {
    const cat = getSideCategoryForDay(days, sides, i);
    if (cat) recentCategories.add(cat);
  }

  const candidates = available.filter((s) => !recentCategories.has(s.categoryId));
  const pool = candidates.length > 0 ? candidates : available;
  return shuffle(pool)[0];
}

export function generatePlan(data: AppData, name: string, startDate: string): Plan | null {
  const { meals, sides, rules, settings } = data;
  const numDays = settings.planDurationDays;

  const noRepeatRule = rules.find(
    (r) => r.type === 'no_repeat_side_category' && r.enabled
  ) as NoRepeatSideCategoryRule | undefined ?? null;

  const noRecentRule = rules.find((r) => r.type === 'no_recent_meals' && r.enabled);
  const recentDays = noRecentRule?.type === 'no_recent_meals' ? noRecentRule.recentDays : 0;
  const recentMealIds = recentDays > 0 ? getRecentMealIds(data, recentDays) : new Set<string>();

  const requiredCategoryRules = rules.filter(
    (r) => r.type === 'required_category' && r.enabled
  ) as RequiredCategoryRule[];

  const stew_rules = requiredCategoryRules.filter(
    (r) => r.categoryType === 'meal' && r.consecutive
  );

  const days: PlanDay[] = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      mealId: '',
      sideId: '',
      notes: '',
    };
  });

  const usedMealIds = new Set<string>();

  const availableMeals = (exclude: Set<string>) =>
    meals.filter((m) => !exclude.has(m.id) && !usedMealIds.has(m.id));

  for (let attempt = 0; attempt < 50; attempt++) {
    const daysCopy: PlanDay[] = days.map((d) => ({ ...d, mealId: '', sideId: '' }));
    usedMealIds.clear();
    let success = true;

    const weekCount = Math.ceil(numDays / 7);
    const stewSlots: number[] = [];

    for (let w = 0; w < weekCount; w++) {
      for (const rule of stew_rules) {
        const windowStart = w * 7;
        const windowEnd = Math.min((w + 1) * 7, numDays);
        const windowSize = windowEnd - windowStart;
        if (windowSize < 2) continue;

        const maxStart = windowEnd - rule.consecutiveDays;
        const startIdx = windowStart + Math.floor(Math.random() * (maxStart - windowStart + 1));
        for (let d = startIdx; d < startIdx + rule.consecutiveDays && d < numDays; d++) {
          stewSlots.push(d);
        }
      }
    }

    const stewMealPool = shuffle(
      meals.filter(
        (m) =>
          stew_rules.some((r) => r.categoryId === m.categoryId) &&
          !recentMealIds.has(m.id)
      )
    );

    let stewMealIndex = 0;
    let currentStewMealId = '';
    for (let di = 0; di < numDays; di++) {
      const isStewSlot = stewSlots.includes(di);

      if (isStewSlot) {
        const prevSlot = di > 0 && stewSlots.includes(di - 1);

        if (!prevSlot) {
          if (stewMealPool[stewMealIndex]) {
            currentStewMealId = stewMealPool[stewMealIndex].id;
            stewMealIndex++;
          } else {
            success = false;
            break;
          }
        }

        if (currentStewMealId && !usedMealIds.has(currentStewMealId)) {
          daysCopy[di].mealId = currentStewMealId;
          usedMealIds.add(currentStewMealId);
        } else if (currentStewMealId && usedMealIds.has(currentStewMealId) && prevSlot) {
          daysCopy[di].mealId = currentStewMealId;
        } else {
          success = false;
          break;
        }
      }
    }

    if (!success) continue;

    for (let di = 0; di < numDays; di++) {
      if (daysCopy[di].mealId) continue;

      const pool = shuffle(availableMeals(recentMealIds));
      if (pool.length === 0) {
        success = false;
        break;
      }

      daysCopy[di].mealId = pool[0].id;
      usedMealIds.add(pool[0].id);
    }

    if (!success) continue;

    for (let di = 0; di < numDays; di++) {
      const meal = meals.find((m) => m.id === daysCopy[di].mealId);
      if (!meal) continue;

      const side = pickSide(meal, sides, daysCopy, di, noRepeatRule);
      daysCopy[di].sideId = side?.id ?? '';
    }

    return {
      id: generateId('plan'),
      name,
      startDate,
      days: daysCopy,
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}
