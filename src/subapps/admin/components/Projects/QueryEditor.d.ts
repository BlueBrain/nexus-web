import * as React from 'react';
import './QueryEditor.less';
declare const QueryEditor: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onUpdate: () => void;
}>;
export default QueryEditor;
