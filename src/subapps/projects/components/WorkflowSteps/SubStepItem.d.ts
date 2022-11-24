import * as React from 'react';
import { StepResource } from '../../types';
import './SubStepItem.less';
declare const SubActivityItem: React.FC<{
  orgLabel: string;
  projectLabel: string;
  substep: StepResource;
}>;
export default SubActivityItem;
