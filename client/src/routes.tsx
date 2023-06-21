import { Route, Routes } from "react-router-dom";
import FoodStorage from "./components/FoodStorage";
import Meals from "./components/Meals";
import Ingredients from "./components/Ingredients";
import Header from "./components/header";
import CreateMeal from "./components/CreateMeal";
import EditMeal from "./components/EditMeal";
import EditIngredients from "./components/EditIngredients";
import MealPlan from "./components/MealPlan";

export default function AppRoutes() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="meals" element={<Meals />} />
        <Route path="meals/edit/:id" element={<EditMeal />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="ingredients/edit/:id" element={<EditIngredients />} />
        <Route path="create-meal" element={<CreateMeal />} />
        <Route path="meal-plan" element={<MealPlan />} />
        <Route path="/" element={<FoodStorage />} />
      </Routes>
    </div>
  );
}
