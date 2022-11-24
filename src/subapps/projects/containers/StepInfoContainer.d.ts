import * as React from 'react';
import { StepResource } from '../types';
declare const StepInfoContainer: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
}>;
export default StepInfoContainer;
