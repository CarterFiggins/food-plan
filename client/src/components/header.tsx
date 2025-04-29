import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/meals">Meals</Link>
      <Link to="/ingredients">Ingredients</Link>
      <Link to="/meal-plan">Meal Plan</Link>
      <Link to="/shopping-list">Shopping List</Link>
    </div>
  );
}
