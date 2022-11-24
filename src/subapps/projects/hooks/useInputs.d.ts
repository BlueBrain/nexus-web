export declare type Item = {
  [key: string]: {
    datatype?: string;
    value: string;
    type: string;
  };
};
export declare type Input = {
  createdAt: string;
  name?: string;
  resourceId: string;
  types: string[];
  description?: string;
};
export declare const useInputs: (
  orgLabel: string,
  projectLabel: string,
  workflowStepId: string
) => {
  inputs: Input[];
  fetchInputs: () => void;
};
