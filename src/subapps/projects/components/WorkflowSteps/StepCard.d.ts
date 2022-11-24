import * as React from 'react';
import { StepResource } from '../../types';
import './StepCard.less';
declare const StepCard: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  substeps: StepResource[];
  onStatusChange: (stepId: string, status: string) => void;
  onPostionChange: (
    stepId: string,
    data: {
      [key: string]: any;
    }
  ) => void;
  onClickAddCard: (previousStepId: string) => void;
  onNameChange: (name: string) => void;
}>;
export default StepCard;
