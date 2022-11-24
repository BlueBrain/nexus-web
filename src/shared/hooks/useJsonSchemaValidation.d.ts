export default function useJsonSchemaValidation(
  schema: any,
  deps?: any[]
): {
  validate: import('ajv').ValidateFunction<unknown>;
  validationError: boolean;
};
