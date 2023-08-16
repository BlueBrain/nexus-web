import * as React from 'react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import AJV from 'ajv-errors';
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
AJV(ajv, { singleError: true });

export default function useJsonSchemaValidation(schema: any, deps?: any[]) {
  const validate = React.useMemo(() => ajv.compile(schema), deps);
  const [validationError, setValidationError] = React.useState<boolean>(false);

  React.useEffect(() => {
    setValidationError(!!(validate.errors && validate.errors.length > 0));
  }, [validate.errors]);

  return { validate, validationError };
}
