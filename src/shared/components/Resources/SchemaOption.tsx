import * as React from 'react';
import './SchemaOption.less';

export interface SchemaTypeOptionProps {
  key: string;
  count?: number;
}

const SchemaTypeOption: React.FunctionComponent<
  SchemaTypeOptionProps
> = props => {
  const { key, count } = props;
  return (
    <div className="schema-value">
      <div className="label">{key}</div>
      {count && <div className="count">{count}</div>}
    </div>
  );
};

export default SchemaTypeOption;
