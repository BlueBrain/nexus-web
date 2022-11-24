import * as React from 'react';
import './Hit.less';
export declare const globalSearchOption: (
  value: string | undefined
) => JSX.Element;
declare const Hit: React.FC<{
  orgLabel?: string;
  projectLabel?: string;
  type: 'project' | 'studio';
}>;
export default Hit;
