import { Alert } from 'antd';
import * as React from 'react';

import useJsonSchemaValidation from '../hooks/useJsonSchemaValidation';

const SchemaValidationFallbackContainer = ({
  children,
  schema,
  dependencies,
  resource,
}: {
  resource: any;
  schema: any;
  dependencies?: any[];
  children?: React.ReactNode;
}) => {
  const { validate, validationError } = useJsonSchemaValidation(
    schema,
    dependencies
  );
  React.useEffect(() => {
    validate(resource);
  }, dependencies);

  return (
    <>
      {validationError ? (
        <Alert
          message={
            <>
              The shape of the data is not as expected for this plugin, see{' '}
              <a href="" target="_blank">
                README
              </a>{' '}
              for expected shape. See below for error details:
              <br />
              <br />
              <ul>
                {validate.errors?.map((e: any, i: number) => (
                  <React.Fragment key={i}>
                    <li>{e.message}</li>
                  </React.Fragment>
                ))}
              </ul>
            </>
          }
          type="error"
        />
      ) : (
        children
      )}
    </>
  );
};

export default SchemaValidationFallbackContainer;
