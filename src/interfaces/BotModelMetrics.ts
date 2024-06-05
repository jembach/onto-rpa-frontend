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
  no_variables: BotModelMetric;
  no_variableTransformation: BotModelMetric;
  no_dataResources: BotModelMetric;
  no_dataResourcesRead: BotModelMetric;
  no_dataResourcesWritten: BotModelMetric;
  ri_dataResourcesAccess: BotModelMetric;
  no_software: BotModelMetric;
  no_contexts: BotModelMetric;
  no_contextSwitches: BotModelMetric;
  ri_contextSwitches: BotModelMetric;
  hpc_n1: BotModelMetric;
  hpc_n2: BotModelMetric;
  hpc_N1: BotModelMetric;
  hpc_N2: BotModelMetric;
  hpc_vocabulary: BotModelMetric;
  hpc_length: BotModelMetric;
  hpc_volume: BotModelMetric;
  hpc_difficulty: BotModelMetric;
  cfc: BotModelMetric;
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
  no_variables: {
    name: "Number of Variables",
    value: 0,
    description: "Number of different variables in the model",
  },
  no_variableTransformation: {
    name: "Number of Variable Transformations",
    value: 0,
    description:
      "How often variables are transformed (read + write in one operation) the model",
  },
  no_dataResources: {
    name: "Number of Data Resources",
    value: 0,
    description: "Number of different data resources in the model",
  },
  no_dataResourcesRead: {
    name: "Number of Data Resources Read",
    value: 0,
    description: "Number of different data resources read by the bot",
  },
  no_dataResourcesWritten: {
    name: "Number of Data Resources Written",
    value: 0,
    description: "Number of different data resources written by the bot",
  },
  ri_dataResourcesAccess: {
    name: "Ratio of Data Resources Access",
    value: 0,
    description: "The ratio of data resources the bot reads from and writes to",
    percentage: false,
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
    description:
      "How often the active context (application + data) changes in the model",
  },
  ri_contextSwitches: {
    name: "Ratio of Context Switches",
    value: 0,
    description:
      "Ratio of the number of context switches to the total number of contexts.",
    percentage: false,
  },
  hpc_n1: {
    name: "Halstead n1",
    value: 0,
    description: "The number of distinct operators",
  },
  hpc_n2: {
    name: "Halstead n2",
    value: 0,
    description: "The number of distinct operands",
  },
  hpc_N1: {
    name: "Halstead N1",
    value: 0,
    description: "The total number of operators",
  },
  hpc_N2: {
    name: "Halstead N2",
    value: 0,
    description: "The total number of operand occurrences",
  },
  hpc_vocabulary: {
    name: "Halstead Vocabulary",
    value: 0,
    description: "The total number of distinct operators and operands",
  },
  hpc_length: {
    name: "Halstead Program Length",
    value: 0,
    description: "The total number of operators and operands",
  },
  hpc_volume: {
    name: "Halstead Volume",
    value: 0,
    description:
      "The total number of operators and operands multiplied by the logarithm of the vocabulary size",
  },
  hpc_difficulty: {
    name: "Halstead Difficulty",
    value: 0,
    description:
      "The difficulty of understanding the code, calculated as (n1/2) * (N2/n2)",
  },
  cfc: {
    name: "Control-flow Complexity",
    value: 0,
    description:
      "Complexity induced by decisions, loops, and branches in the model",
  },
};
