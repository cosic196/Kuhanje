import type {
  AppData,
  Plan,
  PlanDay,
  Meal,
  Side,
  NoRepeatSideCategoryRule,
  NoRepeatMealCategoryRule,
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
      if (d >= cutoff) recentIds.add(day.mealId);
    }
  }
  return recentIds;
}

function getSideCategoryForDay(days: PlanDay[], sides: Side[], dayIndex: number): string | null {
  if (dayIndex < 0 || dayIndex >= days.length) return null;
  const sideId = days[dayIndex].sideId;
  if (!sideId) return null;
  return sides.find((s) => s.id === sideId)?.categoryId ?? null;
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
  if (!noRepeatRule || !noRepeatRule.enabled) return shuffle(available)[0];

  const recentCategories = new Set<string>();
  for (let i = Math.max(0, dayIndex - (noRepeatRule.windowDays - 1)); i < dayIndex; i++) {
    const cat = getSideCategoryForDay(days, sides, i);
    if (cat) recentCategories.add(cat);
  }
  const candidates = available.filter((s) => !recentCategories.has(s.categoryId));
  return shuffle(candidates.length > 0 ? candidates : available)[0];
}

function getRecentMealCategories(
  days: PlanDay[],
  meals: Meal[],
  dayIndex: number,
  windowDays: number
): Set<string> {
  const cats = new Set<string>();
  for (let i = Math.max(0, dayIndex - (windowDays - 1)); i < dayIndex; i++) {
    const mealId = days[i]?.mealId;
    if (!mealId) continue;
    const cat = meals.find((m) => m.id === mealId)?.categoryId;
    if (cat) cats.add(cat);
  }
  return cats;
}

// Returns true if placing a meal with categoryId on dayIndex would exceed the
// required_category rule's maxCount for that day's window.
function isRequiredCategoryMaxed(
  dayIndex: number,
  categoryId: string,
  requiredRules: RequiredCategoryRule[],
  days: PlanDay[],
  meals: Meal[],
  numDays: number
): boolean {
  for (const rule of requiredRules) {
    if (rule.categoryType !== 'meal' || rule.categoryId !== categoryId) continue;
    const maxCount = rule.maxCount ?? rule.minCount;
    const w = Math.floor(dayIndex / rule.everyNDays);
    const wStart = w * rule.everyNDays;
    const wEnd = Math.min((w + 1) * rule.everyNDays, numDays);
    let count = 0;
    for (let d = wStart; d < wEnd; d++) {
      // Skip continuation days — they are part of the same meal instance
      if (!days[d]?.mealId || days[d]?.isSpanContinuation) continue;
      const m = meals.find((mm) => mm.id === days[d].mealId);
      if (m?.categoryId === categoryId) count++;
    }
    if (count >= maxCount) return true;
  }
  return false;
}

function buildDays(
  data: AppData,
  numDays: number,
  fixedDays: Map<number, PlanDay>,
  recentMealIds: Set<string>,
  noRepeatSideRule: NoRepeatSideCategoryRule | null,
  noRepeatMealCatRule: NoRepeatMealCategoryRule | null,
  requiredRules: RequiredCategoryRule[]
): PlanDay[] | null {
  const { meals, sides } = data;

  for (let attempt = 0; attempt < 50; attempt++) {
    const days: PlanDay[] = Array.from({ length: numDays }, (_, i) =>
      fixedDays.has(i)
        ? { ...fixedDays.get(i)! }
        : { date: '', mealId: '', sideId: '', notes: '' }
    );

    const usedMealIds = new Set<string>(
      Array.from(fixedDays.values())
        .map((d) => d.mealId)
        .filter(Boolean)
    );

    let success = true;

    // Assign required meal category slots first
    for (const rule of requiredRules) {
      if (rule.categoryType !== 'meal') continue;
      const maxCount = rule.maxCount ?? rule.minCount;
      const windowCount = Math.ceil(numDays / rule.everyNDays);

      for (let w = 0; w < windowCount; w++) {
        const wStart = w * rule.everyNDays;
        const wEnd = Math.min((w + 1) * rule.everyNDays, numDays);

        // Count already placed meals of this category in fixed days
        let fixedCount = 0;
        for (let di = wStart; di < wEnd; di++) {
          if (fixedDays.has(di)) {
            const m = meals.find((m) => m.id === days[di].mealId);
            if (m?.categoryId === rule.categoryId) fixedCount++;
          }
        }

        const emptySlots: number[] = [];
        for (let di = wStart; di < wEnd; di++) {
          if (!fixedDays.has(di) && !days[di].mealId) emptySlots.push(di);
        }

        const needed = Math.max(0, rule.minCount - fixedCount);
        const canAdd = Math.max(0, maxCount - fixedCount);

        if (needed > emptySlots.length) {
          success = false;
          break;
        }

        const pool = shuffle(
          meals.filter(
            (m) =>
              m.categoryId === rule.categoryId &&
              !recentMealIds.has(m.id) &&
              !usedMealIds.has(m.id)
          )
        );

        if (pool.length < needed) {
          success = false;
          break;
        }

        const maxAddable = Math.min(canAdd, emptySlots.length, pool.length);
        const count = needed + (maxAddable > needed
          ? Math.floor(Math.random() * (maxAddable - needed + 1))
          : 0);

        shuffle([...emptySlots])
          .slice(0, count)
          .forEach((slot, i) => {
            const meal = pool[i];
            days[slot].mealId = meal.id;
            days[slot].isSpanContinuation = false;
            usedMealIds.add(meal.id);
            const span = Math.max(1, meal.daysCount ?? 1);
            for (let k = 1; k < span; k++) {
              const nextSlot = slot + k;
              if (nextSlot >= numDays) break;
              if (fixedDays.has(nextSlot)) break;
              if (days[nextSlot].mealId) break;
              days[nextSlot].mealId = meal.id;
              days[nextSlot].isSpanContinuation = true;
            }
          });
      }

      if (!success) break;
    }

    if (!success) continue;

    // Fill remaining empty days
    let di = 0;
    while (di < numDays) {
      if (fixedDays.has(di) || days[di].mealId) {
        di++;
        continue;
      }

      const recentCats =
        noRepeatMealCatRule?.enabled
          ? getRecentMealCategories(days, meals, di, noRepeatMealCatRule.windowDays)
          : new Set<string>();

      // Bug fix: exclude meals from required categories that have already hit maxCount
      const basePool = meals.filter(
        (m) =>
          !recentMealIds.has(m.id) &&
          !usedMealIds.has(m.id) &&
          !isRequiredCategoryMaxed(di, m.categoryId, requiredRules, days, meals, numDays)
      );
      const filtered = noRepeatMealCatRule?.enabled
        ? basePool.filter((m) => !recentCats.has(m.categoryId))
        : basePool;

      // Fall back to unfiltered if no meals satisfy the category-repeat rule
      const candidatePool = filtered.length > 0 ? filtered : basePool;

      // Bug fix: prefer meals that have at least one side not violating the
      // no-repeat side constraint, so the side fallback path is avoided
      let sideFilteredPool = candidatePool;
      if (noRepeatSideRule?.enabled) {
        const recentSideCats = new Set<string>();
        for (let i = Math.max(0, di - (noRepeatSideRule.windowDays - 1)); i < di; i++) {
          const cat = getSideCategoryForDay(days, sides, i);
          if (cat) recentSideCats.add(cat);
        }
        if (recentSideCats.size > 0) {
          const withValidSide = candidatePool.filter((m) => {
            if (m.possibleSideIds.length === 0) return true;
            return sides
              .filter((s) => m.possibleSideIds.includes(s.id))
              .some((s) => !recentSideCats.has(s.categoryId));
          });
          if (withValidSide.length > 0) sideFilteredPool = withValidSide;
        }
      }

      const meal = shuffle(sideFilteredPool)[0];

      if (!meal) {
        success = false;
        break;
      }

      const span = Math.max(1, meal.daysCount ?? 1);
      days[di].mealId = meal.id;
      days[di].isSpanContinuation = false;
      usedMealIds.add(meal.id);

      // Fill continuation days with the same meal
      for (let k = 1; k < span; k++) {
        const nextDi = di + k;
        if (nextDi >= numDays) break;
        if (fixedDays.has(nextDi)) break;
        if (days[nextDi].mealId) break; // already filled by required rule
        days[nextDi].mealId = meal.id;
        days[nextDi].isSpanContinuation = true;
      }

      di++;
    }

    if (!success) continue;

    // Pick sides for non-fixed days
    for (let di = 0; di < numDays; di++) {
      if (fixedDays.has(di)) continue;
      if (days[di].isSpanContinuation) {
        // Continuation day inherits the same side as the first day of the span
        days[di].sideId = di > 0 ? (days[di - 1]?.sideId ?? '') : '';
        continue;
      }
      const meal = meals.find((m) => m.id === days[di].mealId);
      if (!meal) continue;
      days[di].sideId = pickSide(meal, sides, days, di, noRepeatSideRule)?.id ?? '';
    }

    return days;
  }

  return null;
}

function extractRules(data: AppData) {
  const { rules } = data;
  const noRepeatSideRule =
    (rules.find(
      (r) => r.type === 'no_repeat_side_category' && r.enabled
    ) as NoRepeatSideCategoryRule | undefined) ?? null;
  const noRepeatMealCatRule =
    (rules.find(
      (r) => r.type === 'no_repeat_meal_category' && r.enabled
    ) as NoRepeatMealCategoryRule | undefined) ?? null;
  const noRecentRule = rules.find((r) => r.type === 'no_recent_meals' && r.enabled);
  const recentDays =
    noRecentRule?.type === 'no_recent_meals' ? noRecentRule.recentDays : 0;
  const recentMealIds =
    recentDays > 0 ? getRecentMealIds(data, recentDays) : new Set<string>();
  const requiredRules = rules.filter(
    (r) => r.type === 'required_category' && r.enabled
  ) as RequiredCategoryRule[];
  return { noRepeatSideRule, noRepeatMealCatRule, recentMealIds, requiredRules };
}

export function generatePlan(data: AppData, name: string, startDate: string): Plan | null {
  const numDays = data.settings.planDurationDays;
  const { noRepeatSideRule, noRepeatMealCatRule, recentMealIds, requiredRules } =
    extractRules(data);

  const result = buildDays(
    data,
    numDays,
    new Map(),
    recentMealIds,
    noRepeatSideRule,
    noRepeatMealCatRule,
    requiredRules
  );
  if (!result) return null;

  const days = result.map((d, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return { ...d, date: date.toISOString().slice(0, 10) };
  });

  return {
    id: generateId('plan'),
    name,
    startDate,
    days,
    createdAt: new Date().toISOString(),
  };
}

export function regenerateDays(
  data: AppData,
  plan: Plan,
  indicesToRegenerate: number[]
): Plan | null {
  const { noRepeatSideRule, noRepeatMealCatRule, recentMealIds, requiredRules } =
    extractRules(data);

  const regenerateSet = new Set(indicesToRegenerate);
  const numDays = plan.days.length;

  const fixedDays = new Map<number, PlanDay>();
  for (let i = 0; i < numDays; i++) {
    if (!regenerateSet.has(i)) fixedDays.set(i, plan.days[i]);
  }

  const result = buildDays(
    data,
    numDays,
    fixedDays,
    recentMealIds,
    noRepeatSideRule,
    noRepeatMealCatRule,
    requiredRules
  );
  if (!result) return null;

  const days = result.map((d, i) => ({
    ...d,
    date: plan.days[i].date,
    notes: d.notes || plan.days[i].notes,
  }));

  return { ...plan, days };
}
