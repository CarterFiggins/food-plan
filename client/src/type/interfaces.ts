import { Ingredients } from "../components/Ingredients";

export interface MealInterface {
  id: string;
  name: string;
  recipeItems: RecipeItemsInterfaceIngredient[];
}

export interface ShoppingListInterface {
  id: string;
  name: string;
  is_favorite: boolean;
}

export interface ViewShoppingListInterface {
  id: string;
  name: string;
  is_favorite: boolean;
  shoppingItems: ShoppingItemInterface[];
}

export interface ShoppingItemInterface {
  id: string;
  ingredient: IngredientInterface;
  is_checked: boolean;
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
