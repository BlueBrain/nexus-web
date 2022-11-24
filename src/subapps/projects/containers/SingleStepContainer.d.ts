import * as React from 'react';
import { StepResource } from '../types';
declare const SingleStepContainer: React.FC<{
  projectLabel: string;
  orgLabel: string;
  step: StepResource;
  onUpdate: () => void;
  parentLabel?: string;
}>;
export default SingleStepContainer;
