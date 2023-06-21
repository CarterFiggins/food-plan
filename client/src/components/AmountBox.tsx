import _ from "lodash";

export default function AmountBox({ ingredients }: { ingredients: any }) {
  return(
    <div className="amount-box-container">
      {_.map(ingredients, (type, ingredientName) => {
        const currentUnitName = type.current.unit;
        const currentAmount = type.current.amount;
        const leftoverAmount = currentAmount - type.plan[currentUnitName]
        const showColor = leftoverAmount || leftoverAmount === 0
        const boxColor = leftoverAmount > 0 ? "green-amount" : "red-amount";
        const showCurrentAmount = currentAmount || currentAmount === 0;
        return (
          <div key={ingredientName}  className={`amount-box ${showColor ? boxColor : ""}`} >
            Ingredient: {ingredientName}
            {_.map(type.plan, (amount, unitName) => {
              return (
                <div key={unitName}>
                  Plan Amount: {`${amount} ${unitName}`}
                </div>
              )
            })}
            {currentUnitName && showCurrentAmount && (
              <>
                <div>
                  Current Amount: {`${currentAmount} ${currentUnitName}`}
                </div>
                <div>
                  {type.plan[currentUnitName] && <div className="leftover">Leftover: {leftoverAmount} {currentUnitName}</div>}        
                </div>
              </>
            )}
         </div>
        )
      })}
    </div>
  )
}
