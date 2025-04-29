import { useEffect, useState } from "react";
import { MealInterface, MealPlanInterface } from "../type/interfaces";
import _ from "lodash";
import DayItem from "./DayItem";
import MealPlanIngredients from "./MealPlanIngredients";

export default function LoadMeals() {
  const [meals, setMeals] = useState<MealInterface[] | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlanInterface[] | null>(null);
  const [flip, setFlip] = useState(false);

  const refetch = () => {
    setFlip((current) => !current);
  };

  useEffect(() => {
    fetch("/meals")
      .then((res) => res.json())
      .then((data) => setMeals(data));
    fetch("/meal-plan")
      .then((res) => res.json())
      .then((data) => setMealPlans(data));
  }, [flip]);

  console.log("mealPlans")
  console.log(mealPlans)
  return (
    <div>
      {meals && mealPlans ? <MealPlan meals={meals} mealPlans={mealPlans} refetch={refetch} /> : <h1>Loading...</h1>}
    </div>
  );
}

export function MealPlan({
  meals,
  mealPlans,
  refetch,
}: {
  meals: MealInterface[];
    mealPlans: MealPlanInterface[];
  refetch: () => void;
  }) {
  
  const week1 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const week2 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


  const findMealPlan = (position: number): MealPlanInterface | undefined  => _.find(mealPlans, (plan) => plan.position === position)

  // TODO: could make 2d array for weeks and have a double loop in case we want to add more weeks
  return (
    <div>
      <div className="meal-plan-days">
        {_.map(week1, (day, index) => {
          const mealPlan = findMealPlan(index)
          return ( 
            <DayItem
              key={`${day}1`}
              day={day}
              position={index}
              meals={meals}
              mealPlan={mealPlan}
              refetch={refetch}
            />
          )
        })}
      </div>
      <div className="meal-plan-days">
        {_.map(week2, (day, index) => {
          const week2Index = week1.length+index
          const mealPlan = findMealPlan(week2Index)
          return ( 
            <DayItem
              key={`${day}2`}
              day={day}
              position={week2Index}
              meals={meals}
              mealPlan={mealPlan}
              refetch={refetch}
            />
          )
        })}
      </div>
      <MealPlanIngredients mealPlans={mealPlans} />
    </div>
  );
}
