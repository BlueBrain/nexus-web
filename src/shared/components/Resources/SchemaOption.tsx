import * as React from 'react';
import './SchemaOption.less';

export interface SchemaTypeOptionProps {
  value: string;
  count?: number;
}

const SchemaTypeOption: React.FunctionComponent<
  SchemaTypeOptionProps
> = props => {
  const { value, count } = props;
  let label = value;
  if (value === '_') {
    label = 'Wildcard Schema';
  }
  return (
    <div className="schema-value">
      <div className="label">{label}</div>
      {count && (
        <div className="count">
          {count} {`Resource${count > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
};

export default SchemaTypeOption;
