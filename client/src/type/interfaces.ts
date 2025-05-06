export interface MealInterface {
  id: string;
  name: string;
  recipeItems: RecipeItemsInterfaceIngredient[];
}

export interface IngredientItemInterface {
  id: string;
  ingredient: IngredientInterface;
  amount: number;
  ingredientAmount?: number;
  unit: string;
  ingredientUnit?: string;
}

export interface ShoppingListInterface {
  id: string;
  name: string;
  is_favorite: boolean;
}

export interface ViewShoppingListInterface {
  meals: MealInterface[];
  shoppingList: ViewListInterface;
}

export interface ViewListInterface {
  id: string;
  name: string;
  is_favorite: boolean;
  shoppingItems: ShoppingItemInterface[];
}

export interface ShoppingItemInterface {
  id: string;
  ingredient: IngredientInterface;
  is_checked: boolean;
  units: UnitItemInterface[];
}

export interface UnitItemInterface {
  id: string;
  amount: number;
  unit: string;
}

export interface MealPlanInterface {
  id: string;
  position: number;
  meal: MealInterface;
  meal_created: boolean
}

export interface RecipeItemsInterfaceMeal {
  id: string;
  meal: MealInterface;
  amount: number;
  unit: string;
}

export interface RecipeItemsInterfaceIngredient {
  id: string;
  ingredient: IngredientInterface;
  amount: number;
  unit: string;
}

export interface IngredientInterface {
  id: string;
  name: string;
  storage_life?: number;
  storage_count?: number;
  storage_unit?: string;
  meals?: MealInterface[];
}
