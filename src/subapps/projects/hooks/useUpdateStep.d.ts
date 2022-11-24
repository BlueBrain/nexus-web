export declare const useUpdateStep: (
  orgLabel: string,
  projectLabel: string,
  rev: number
) => {
  updateStep: (
    stepId: string,
    data: {
      [key: string]: any;
    }
  ) => Promise<void>;
  success: boolean | undefined;
  error: Error | undefined;
};
