import * as React from 'react';
import { Input } from 'antd';

export interface RawQueryViewProps {
  viewType: "es" | "sparql";
}

const TextArea = Input.TextArea;

const RawQueryView: React.FunctionComponent<RawQueryViewProps> = ({ viewType }) : JSX.Element => {
  return (
    <TextArea
      className="query"
      defaultValue={`Enter raw query for this ${viewType} View`}
    />
  );
};

export default RawQueryView;
