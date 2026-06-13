export type Language = 'hr' | 'en';

export interface Translations {
  appName: string;
  nav: {
    plans: string;
    meals: string;
    sides: string;
    categories: string;
    ingredients: string;
    rules: string;
  };
  languageSelect: {
    title: string;
    subtitle: string;
    continue: string;
  };
  plans: {
    title: string;
    newPlan: string;
    noPlanTitle: string;
    noPlanSub: string;
    daysCount: (n: number) => string;
    addMealsPrompt: string;
    addMealsLink: string;
    deletePlan: string;
    modalTitleNew: string;
    modalTitleProposal: string;
    planNameLabel: string;
    planNamePlaceholder: (date: string) => string;
    startDateLabel: string;
    durationInfo: (n: number) => string;
    durationNote: string;
    generateBtn: string;
    generatingBtn: string;
    cancelBtn: string;
    confirmBtn: string;
    regenerateBtn: string;
    deselectInstruction: string;
    deselectAll: string;
    selectAll: string;
    errorGenerate: string;
    errorGenerateShort: string;
    errorRegenerate: string;
    errorRegenerateShort: string;
    notSelected: string;
  };
  planDetail: {
    notFound: string;
    backToPlans: string;
    tabPlan: string;
    tabShopping: string;
    regenModeInstruction: string;
    regenBtn: (n: number) => string;
    regenBtnLoading: string;
    closeBtn: string;
    regenDaysBtn: string;
    deselectAll: string;
    selectAll: string;
    notSelected: string;
    continuation: string;
    mealIngredients: string;
    sideIngredients: string;
    recipe: string;
    shoppingInstruction: string;
    refreshBtn: string;
    planIngredients: string;
    markedLabel: (checked: number, total: number) => string;
    noIngredients: string;
    noIngredientsNote: string;
    commonIngredients: string;
    selectMeal: string;
    noSide: string;
    notesPlaceholder: string;
    saveBtn: string;
    cancelBtn: string;
  };
  meals: {
    title: string;
    addBtn: string;
    search: string;
    noMeals: string;
    noMealsSub: string;
    other: string;
    deleteConfirm: string;
    modalTitleNew: string;
    modalTitleEdit: string;
    nameLabel: string;
    namePlaceholder: string;
    daysLabel: string;
    daysUnit1: string;
    daysUnitN: string;
    categoryLabel: string;
    newCategoryBtn: string;
    categoryNamePlaceholder: string;
    ingredientsLabel: string;
    sidesLabel: string;
    noSides: string;
    newSideTitle: string;
    newSideNamePlaceholder: string;
    addAndCheck: string;
    cancelInline: string;
    addNewSide: string;
    recipeLabel: string;
    recipePlaceholder: string;
    saveBtn: string;
    cancelBtn: string;
    ingredientCount: (n: number) => string;
    sideCount: (n: number) => string;
    noDetails: string;
    possibleSidesLabel: string;
    ingredientsSection: string;
    recipeSection: string;
  };
  sides: {
    title: string;
    addBtn: string;
    noSides: string;
    noSidesSub: string;
    other: string;
    deleteConfirm: string;
    modalTitleNew: string;
    modalTitleEdit: string;
    nameLabel: string;
    namePlaceholder: string;
    categoryLabel: string;
    newCategoryBtn: string;
    categoryNamePlaceholder: string;
    ingredientsLabel: string;
    recipeLabel: string;
    recipePlaceholder: string;
    saveBtn: string;
    cancelBtn: string;
    ingredientCount: (n: number) => string;
    ingredientsSection: string;
    recipeSection: string;
    noDetails: string;
  };
  categories: {
    title: string;
    mealCats: string;
    sideCats: string;
    noCats: string;
    newCatPlaceholder: string;
  };
  ingredients: {
    title: string;
    addTitle: string;
    namePlaceholder: string;
    isCommon: string;
    searchPlaceholder: string;
    commonLabel: string;
    otherLabel: string;
    noIngredients: string;
    editCommonLabel: string;
  };
  ingredientEditor: {
    searchPlaceholder: string;
    emptyMessage: string;
    addNewIngredient: (name: string) => string;
    amountPlaceholder: string;
    unitPlaceholder: string;
    addIngredient: string;
  };
  rules: {
    title: string;
    planSettings: string;
    durationLabel: string;
    noRepeatLabel: string;
    noRepeatSideTitle: string;
    noRepeatSideDesc: string;
    windowDaysLabel: string;
    noRepeatMealTitle: string;
    noRepeatMealDesc: string;
    noRecentTitle: string;
    noRecentDesc: string;
    recentDaysLabel: string;
    requiredTitle: string;
    noRequired: string;
    addBtn: string;
    typeLabel: string;
    mealType: string;
    sideType: string;
    catLabel: string;
    catPlaceholder: string;
    minLabel: string;
    maxLabel: string;
    everyNLabel: string;
    saveBtn: string;
    cancelBtn: string;
    disabled: string;
    exportImport: string;
    exportBtn: string;
    importBtn: string;
    dataNote: string;
    importConfirm: string;
    importSuccess: string;
    importError: string;
    timesExact: (n: number) => string;
    timesRange: (min: number, max: number) => string;
    everyNDays: (n: number) => string;
  };
  daysShort: string[];
  daysFull: string[];
  locale: string;
}

export const translations: Record<Language, Translations> = {
  hr: {
    appName: 'Planer obroka',
    nav: {
      plans: 'Planovi',
      meals: 'Jela',
      sides: 'Prilozi',
      categories: 'Kategorije',
      ingredients: 'Namirnice',
      rules: 'Pravila',
    },
    languageSelect: {
      title: 'Odaberite jezik',
      subtitle: 'Dobrodošli u Planer obroka!',
      continue: 'Nastavi',
    },
    plans: {
      title: 'Planovi obroka',
      newPlan: 'Novi plan',
      noPlanTitle: 'Nema planova',
      noPlanSub: 'Generirajte prvi plan obroka!',
      daysCount: (n) => `${n} dana`,
      addMealsPrompt: 'Za generiranje plana dodajte najmanje 5 jela.',
      addMealsLink: 'Dodajte jela →',
      deletePlan: 'Obrisati ovaj plan?',
      modalTitleNew: 'Novi plan',
      modalTitleProposal: 'Prijedlog plana',
      planNameLabel: 'Naziv plana (neobavezno)',
      planNamePlaceholder: (date) => `Plan ${date}`,
      startDateLabel: 'Datum početka',
      durationInfo: (n) => `Trajanje: ${n} dana`,
      durationNote: '(može se promijeniti u Pravilima)',
      generateBtn: 'Generiraj plan',
      generatingBtn: 'Generiranje...',
      cancelBtn: 'Odustani',
      confirmBtn: 'Potvrdi plan',
      regenerateBtn: 'Regeneriraj neoznačene',
      deselectInstruction: 'Odznači dane koje želiš promijeniti.',
      deselectAll: 'Odznači sve',
      selectAll: 'Označi sve',
      errorGenerate: 'Nije moguće generirati plan. Provjerite imate li dovoljno jela i da pravila nisu prestroga.',
      errorGenerateShort: 'Greška pri generiranju plana.',
      errorRegenerate: 'Nije moguće regenerirati dane. Pokušajte opet ili smanjite ograničenja.',
      errorRegenerateShort: 'Greška pri regeneriranju.',
      notSelected: 'Nije odabrano',
    },
    planDetail: {
      notFound: 'Plan nije pronađen.',
      backToPlans: 'Povratak na planove',
      tabPlan: 'Plan obroka',
      tabShopping: 'Kupovina',
      regenModeInstruction: 'Odznači dane koje želiš regenerirati',
      regenBtn: (n) => n > 0 ? `Regeneriraj (${n})` : 'Regeneriraj',
      regenBtnLoading: 'Generiranje...',
      closeBtn: 'Zatvori',
      regenDaysBtn: 'Regeneriraj dane',
      deselectAll: 'Odznači sve',
      selectAll: 'Označi sve',
      notSelected: 'Nije odabrano',
      continuation: 'nastavak',
      mealIngredients: 'Namirnice jela:',
      sideIngredients: 'Namirnice priloga:',
      recipe: 'Recept',
      shoppingInstruction: 'Označite što trebate kupiti',
      refreshBtn: 'Osvježi',
      planIngredients: 'Namirnice za plan',
      markedLabel: (checked, total) => `${checked}/${total} označeno`,
      noIngredients: 'Nema namirnica',
      noIngredientsNote: 'Dodajte namirnice jelima i prilozima',
      commonIngredients: '⭐ Stalne namirnice',
      selectMeal: '-- Odaberi jelo --',
      noSide: '-- Bez priloga --',
      notesPlaceholder: 'Bilješka (neobavezno)',
      saveBtn: 'Spremi',
      cancelBtn: 'Odustani',
    },
    meals: {
      title: 'Jela',
      addBtn: 'Dodaj',
      search: 'Pretraži jela...',
      noMeals: 'Nema jela',
      noMealsSub: 'Dodajte prvo jelo!',
      other: 'Ostalo',
      deleteConfirm: 'Obrisati ovo jelo?',
      modalTitleNew: 'Novo jelo',
      modalTitleEdit: 'Uredi jelo',
      nameLabel: 'Naziv *',
      namePlaceholder: 'Npr. Grah s kobasicom',
      daysLabel: 'Traje dana',
      daysUnit1: 'dan (standardno)',
      daysUnitN: 'uzastopna dana',
      categoryLabel: 'Kategorija',
      newCategoryBtn: 'Nova',
      categoryNamePlaceholder: 'Naziv kategorije...',
      ingredientsLabel: 'Namirnice',
      sidesLabel: 'Mogući prilozi',
      noSides: 'Nema dodanih priloga.',
      newSideTitle: 'Novi prilog',
      newSideNamePlaceholder: 'Naziv priloga (npr. Tjestenina)...',
      addAndCheck: 'Dodaj i označi',
      cancelInline: 'Otkaži',
      addNewSide: 'Dodaj novi prilog',
      recipeLabel: 'Recept',
      recipePlaceholder: 'Upute za pripremu...',
      saveBtn: 'Spremi',
      cancelBtn: 'Odustani',
      ingredientCount: (n) => `${n} nam.`,
      sideCount: (n) => `${n} pril.`,
      noDetails: 'Nema dodatnih detalja.',
      possibleSidesLabel: 'Mogući prilozi',
      ingredientsSection: 'Namirnice',
      recipeSection: 'Recept',
    },
    sides: {
      title: 'Prilozi',
      addBtn: 'Dodaj',
      noSides: 'Nema dodanih priloga',
      noSidesSub: 'Dodajte prve priloge (tjestenina, krumpir...)',
      other: 'Ostalo',
      deleteConfirm: 'Obrisati ovaj prilog?',
      modalTitleNew: 'Novi prilog',
      modalTitleEdit: 'Uredi prilog',
      nameLabel: 'Naziv *',
      namePlaceholder: 'Npr. Tjestenina',
      categoryLabel: 'Kategorija',
      newCategoryBtn: 'Nova',
      categoryNamePlaceholder: 'Naziv kategorije...',
      ingredientsLabel: 'Namirnice',
      recipeLabel: 'Recept',
      recipePlaceholder: 'Upute za pripremu...',
      saveBtn: 'Spremi',
      cancelBtn: 'Odustani',
      ingredientCount: (n) => `${n} nam.`,
      ingredientsSection: 'Namirnice',
      recipeSection: 'Recept',
      noDetails: 'Nema dodatnih detalja.',
    },
    categories: {
      title: 'Kategorije',
      mealCats: 'Kategorije jela',
      sideCats: 'Kategorije priloga',
      noCats: 'Nema kategorija.',
      newCatPlaceholder: 'Nova kategorija...',
    },
    ingredients: {
      title: 'Namirnice',
      addTitle: 'Dodaj novu namirnicu',
      namePlaceholder: 'Naziv namirnice...',
      isCommon: 'Stalna namirnica (sol, ulje, šećer...)',
      searchPlaceholder: 'Pretraži namirnice...',
      commonLabel: '⭐ Stalne namirnice',
      otherLabel: 'Ostale namirnice',
      noIngredients: 'Nema namirnica.',
      editCommonLabel: 'Stalna',
    },
    ingredientEditor: {
      searchPlaceholder: 'Traži namirnicu...',
      emptyMessage: 'Upiši naziv za pretragu ili dodavanje.',
      addNewIngredient: (name) => `Dodaj novu namirnicu "${name}"`,
      amountPlaceholder: 'Kol.',
      unitPlaceholder: 'Jed.',
      addIngredient: 'Dodaj namirnicu',
    },
    rules: {
      title: 'Pravila i postavke',
      planSettings: 'Postavke plana',
      durationLabel: 'Trajanje plana (dana)',
      noRepeatLabel: 'Ne ponavljaj u planu (dana)',
      noRepeatSideTitle: 'Ne ponavljaj vrstu priloga',
      noRepeatSideDesc: 'Ista kategorija priloga ne smije se pojaviti unutar N uzastopnih dana.',
      windowDaysLabel: 'Prozor dana:',
      noRepeatMealTitle: 'Ne ponavljaj vrstu jela',
      noRepeatMealDesc: 'Ista kategorija jela ne smije se pojaviti unutar N uzastopnih dana.',
      noRecentTitle: 'Izbjegavaj nedavna jela',
      noRecentDesc: 'Ne koristi jela koja su bila u planu unutar zadnjeg N dana.',
      recentDaysLabel: 'Zadnjih dana:',
      requiredTitle: 'Obavezne kategorije',
      noRequired: 'Nema obaveznih kategorija.',
      addBtn: 'Dodaj',
      typeLabel: 'Tip',
      mealType: 'Jelo',
      sideType: 'Prilog',
      catLabel: 'Kategorija *',
      catPlaceholder: '-- Odaberi --',
      minLabel: 'Min. puta',
      maxLabel: 'Max. puta',
      everyNLabel: 'Svakih N dana',
      saveBtn: 'Spremi',
      cancelBtn: 'Odustani',
      disabled: 'isključeno',
      exportImport: 'Izvoz / Uvoz podataka',
      exportBtn: 'Izvezi',
      importBtn: 'Uvezi',
      dataNote: 'Svi podaci se čuvaju u pregledniku. Redovito izvozite kao sigurnosnu kopiju.',
      importConfirm: 'Ovo će zamijeniti sve trenutne podatke. Nastaviti?',
      importSuccess: 'Podaci uspješno uvezeni!',
      importError: 'Greška pri uvozu datoteke!',
      timesExact: (n) => `Točno ${n}×`,
      timesRange: (min, max) => `${min}–${max}×`,
      everyNDays: (n) => `svakih ${n} dana`,
    },
    daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
    daysFull: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'],
    locale: 'hr-HR',
  },
  en: {
    appName: 'Meal Planner',
    nav: {
      plans: 'Plans',
      meals: 'Meals',
      sides: 'Sides',
      categories: 'Categories',
      ingredients: 'Ingredients',
      rules: 'Rules',
    },
    languageSelect: {
      title: 'Choose language',
      subtitle: 'Welcome to Meal Planner!',
      continue: 'Continue',
    },
    plans: {
      title: 'Meal Plans',
      newPlan: 'New Plan',
      noPlanTitle: 'No plans yet',
      noPlanSub: 'Generate your first meal plan!',
      daysCount: (n) => `${n} days`,
      addMealsPrompt: 'Add at least 5 meals to generate a plan.',
      addMealsLink: 'Add meals →',
      deletePlan: 'Delete this plan?',
      modalTitleNew: 'New Plan',
      modalTitleProposal: 'Plan Proposal',
      planNameLabel: 'Plan name (optional)',
      planNamePlaceholder: (date) => `Plan ${date}`,
      startDateLabel: 'Start date',
      durationInfo: (n) => `Duration: ${n} days`,
      durationNote: '(can be changed in Rules)',
      generateBtn: 'Generate Plan',
      generatingBtn: 'Generating...',
      cancelBtn: 'Cancel',
      confirmBtn: 'Confirm Plan',
      regenerateBtn: 'Regenerate unchecked',
      deselectInstruction: 'Uncheck the days you want to change.',
      deselectAll: 'Deselect all',
      selectAll: 'Select all',
      errorGenerate: 'Cannot generate plan. Check that you have enough meals and the rules are not too strict.',
      errorGenerateShort: 'Error generating plan.',
      errorRegenerate: 'Cannot regenerate days. Try again or loosen the constraints.',
      errorRegenerateShort: 'Error regenerating.',
      notSelected: 'Not selected',
    },
    planDetail: {
      notFound: 'Plan not found.',
      backToPlans: 'Back to plans',
      tabPlan: 'Meal Plan',
      tabShopping: 'Shopping',
      regenModeInstruction: 'Uncheck the days you want to regenerate',
      regenBtn: (n) => n > 0 ? `Regenerate (${n})` : 'Regenerate',
      regenBtnLoading: 'Generating...',
      closeBtn: 'Close',
      regenDaysBtn: 'Regenerate days',
      deselectAll: 'Deselect all',
      selectAll: 'Select all',
      notSelected: 'Not selected',
      continuation: 'continued',
      mealIngredients: 'Meal ingredients:',
      sideIngredients: 'Side ingredients:',
      recipe: 'Recipe',
      shoppingInstruction: 'Check off what you need to buy',
      refreshBtn: 'Refresh',
      planIngredients: 'Plan ingredients',
      markedLabel: (checked, total) => `${checked}/${total} checked`,
      noIngredients: 'No ingredients',
      noIngredientsNote: 'Add ingredients to meals and sides',
      commonIngredients: '⭐ Pantry staples',
      selectMeal: '-- Select meal --',
      noSide: '-- No side --',
      notesPlaceholder: 'Note (optional)',
      saveBtn: 'Save',
      cancelBtn: 'Cancel',
    },
    meals: {
      title: 'Meals',
      addBtn: 'Add',
      search: 'Search meals...',
      noMeals: 'No meals',
      noMealsSub: 'Add your first meal!',
      other: 'Other',
      deleteConfirm: 'Delete this meal?',
      modalTitleNew: 'New Meal',
      modalTitleEdit: 'Edit Meal',
      nameLabel: 'Name *',
      namePlaceholder: 'E.g. Bean stew',
      daysLabel: 'Lasts days',
      daysUnit1: 'day (standard)',
      daysUnitN: 'consecutive days',
      categoryLabel: 'Category',
      newCategoryBtn: 'New',
      categoryNamePlaceholder: 'Category name...',
      ingredientsLabel: 'Ingredients',
      sidesLabel: 'Possible sides',
      noSides: 'No sides added.',
      newSideTitle: 'New side',
      newSideNamePlaceholder: 'Side name (e.g. Pasta)...',
      addAndCheck: 'Add and select',
      cancelInline: 'Cancel',
      addNewSide: 'Add new side',
      recipeLabel: 'Recipe',
      recipePlaceholder: 'Preparation instructions...',
      saveBtn: 'Save',
      cancelBtn: 'Cancel',
      ingredientCount: (n) => `${n} ing.`,
      sideCount: (n) => `${n} sides`,
      noDetails: 'No additional details.',
      possibleSidesLabel: 'Possible sides',
      ingredientsSection: 'Ingredients',
      recipeSection: 'Recipe',
    },
    sides: {
      title: 'Sides',
      addBtn: 'Add',
      noSides: 'No sides added',
      noSidesSub: 'Add your first sides (pasta, potatoes...)',
      other: 'Other',
      deleteConfirm: 'Delete this side?',
      modalTitleNew: 'New Side',
      modalTitleEdit: 'Edit Side',
      nameLabel: 'Name *',
      namePlaceholder: 'E.g. Pasta',
      categoryLabel: 'Category',
      newCategoryBtn: 'New',
      categoryNamePlaceholder: 'Category name...',
      ingredientsLabel: 'Ingredients',
      recipeLabel: 'Recipe',
      recipePlaceholder: 'Preparation instructions...',
      saveBtn: 'Save',
      cancelBtn: 'Cancel',
      ingredientCount: (n) => `${n} ing.`,
      ingredientsSection: 'Ingredients',
      recipeSection: 'Recipe',
      noDetails: 'No additional details.',
    },
    categories: {
      title: 'Categories',
      mealCats: 'Meal categories',
      sideCats: 'Side categories',
      noCats: 'No categories.',
      newCatPlaceholder: 'New category...',
    },
    ingredients: {
      title: 'Ingredients',
      addTitle: 'Add new ingredient',
      namePlaceholder: 'Ingredient name...',
      isCommon: 'Pantry staple (salt, oil, sugar...)',
      searchPlaceholder: 'Search ingredients...',
      commonLabel: '⭐ Pantry staples',
      otherLabel: 'Other ingredients',
      noIngredients: 'No ingredients.',
      editCommonLabel: 'Staple',
    },
    ingredientEditor: {
      searchPlaceholder: 'Search ingredient...',
      emptyMessage: 'Type a name to search or add.',
      addNewIngredient: (name) => `Add new ingredient "${name}"`,
      amountPlaceholder: 'Qty.',
      unitPlaceholder: 'Unit',
      addIngredient: 'Add ingredient',
    },
    rules: {
      title: 'Rules & Settings',
      planSettings: 'Plan settings',
      durationLabel: 'Plan duration (days)',
      noRepeatLabel: 'No repeat within plan (days)',
      noRepeatSideTitle: 'No repeat side category',
      noRepeatSideDesc: 'The same side category cannot appear within N consecutive days.',
      windowDaysLabel: 'Window days:',
      noRepeatMealTitle: 'No repeat meal category',
      noRepeatMealDesc: 'The same meal category cannot appear within N consecutive days.',
      noRecentTitle: 'Avoid recent meals',
      noRecentDesc: 'Do not use meals that were in a plan within the last N days.',
      recentDaysLabel: 'Recent days:',
      requiredTitle: 'Required categories',
      noRequired: 'No required categories.',
      addBtn: 'Add',
      typeLabel: 'Type',
      mealType: 'Meal',
      sideType: 'Side',
      catLabel: 'Category *',
      catPlaceholder: '-- Select --',
      minLabel: 'Min. times',
      maxLabel: 'Max. times',
      everyNLabel: 'Every N days',
      saveBtn: 'Save',
      cancelBtn: 'Cancel',
      disabled: 'disabled',
      exportImport: 'Export / Import data',
      exportBtn: 'Export',
      importBtn: 'Import',
      dataNote: 'All data is stored in the browser. Export regularly as a backup.',
      importConfirm: 'This will replace all current data. Continue?',
      importSuccess: 'Data imported successfully!',
      importError: 'Error importing file!',
      timesExact: (n) => `Exactly ${n}×`,
      timesRange: (min, max) => `${min}–${max}×`,
      everyNDays: (n) => `every ${n} days`,
    },
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    locale: 'en-GB',
  },
};
