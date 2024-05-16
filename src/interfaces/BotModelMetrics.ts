export interface BotModelMetric {
  name: string;
  value: number;
  description: string;
  percentage?: boolean;
}

export interface BotModelMetrics {
  no_operations: BotModelMetric;
  no_automationOperations: BotModelMetric;
  ri_automationOperations: BotModelMetric;
  no_decisions: BotModelMetric;
  no_nestingDepthMax: BotModelMetric;
  no_nestingDepthAvg: BotModelMetric;
  no_software: BotModelMetric;
  no_contexts: BotModelMetric;
  no_contextSwitches: BotModelMetric;
  ri_contextSwitches: BotModelMetric;
}

export const initialBotModelMetrics: BotModelMetrics = {
  no_operations: {
    name: "Number of Operations",
    value: 0,
    description: "Number of operations in the model",
  },
  no_automationOperations: {
    name: "Number of Automation Operations",
    value: 0,
    description: "Number of operations of the type Automation Operations",
  },
  ri_automationOperations: {
    name: "Ratio of Automation Operations",
    value: 0,
    description: "Percentage of operations of the type Automation Operations",
    percentage: true,
  },
  no_decisions: {
    name: "Number of Decisions",
    value: 0,
    description: "Number of decision operations in the model",
  },
  no_nestingDepthMax: {
    name: "Maximum Nesting Depth",
    value: 0,
    description: "Maximum nesting depth of the model",
  },
  no_nestingDepthAvg: {
    name: "Average Nesting Depth",
    value: 0,
    description: "Average nesting depth of the model",
  },
  no_software: {
    name: "Number of Different Software",
    value: 0,
    description: "Number of different software automated by the bot",
  },
  no_contexts: {
    name: "Number of Contexts",
    value: 0,
    description: "Number of different contexts in the model",
  },
  no_contextSwitches: {
    name: "Number of Context Switches",
    value: 0,
    description: "Number of context switches in the model",
  },
  ri_contextSwitches: {
    name: "Ratio of Context Switches",
    value: 0,
    description: "",
    percentage: false,
  },
};
