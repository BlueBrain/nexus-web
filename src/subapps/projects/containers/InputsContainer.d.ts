import * as React from 'react';
import './InputsContainer.less';
export declare const DATASET_KEY = 'nexus-dataset';
declare const InputsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
  onSuccess: () => void;
  onCancel: () => void;
}>;
export default InputsContainer;
