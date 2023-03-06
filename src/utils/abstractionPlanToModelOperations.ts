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

  return modelOperations;
}

export default abstractionPlanToModelOperations;
