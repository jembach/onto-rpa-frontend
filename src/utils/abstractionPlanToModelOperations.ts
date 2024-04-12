import {
  AbstractionModelOperations,
  AbstractionPlan,
} from "../interfaces/BotModelAbstraction";

function abstractionPlanToModelOperations(
  abstractionPlan: AbstractionPlan
): AbstractionModelOperations {
  const modelOperations: AbstractionModelOperations = {
    elementsToDelete: abstractionPlan.elimination,
    elementsToRename: [],
  };

  abstractionPlan.aggregation.forEach((aggrGroup) => {
    const listOfOperations = aggrGroup.operations;
    const firstOperation = listOfOperations.shift();
    listOfOperations.forEach((operation) => {
      modelOperations.elementsToDelete.push(operation);
    });
    modelOperations.elementsToRename.push([firstOperation!, aggrGroup.label]);
  });

  return modelOperations;
}

export default abstractionPlanToModelOperations;
