import * as React from 'react';
import { StepResource, WorkflowStepMetadata } from '../../types';
import './WorkflowStepWithActivityForm.less';
declare const WorkflowStepWithActivityForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: WorkflowStepMetadata): void;
  onDeprecate?(): any;
  busy: boolean;
  parentLabel?: string | undefined;
  layout?: 'vertical' | 'horisontal';
  title?: string;
  workflowStep?: StepResource;
  informedByIds?: string[];
  siblings?: {
    name: string;
    '@id': string;
  }[];
  activityList: {
    label: string;
    '@id': string;
  }[];
  allowActivitySearch?: boolean;
  defaultActivityType?: string;
  isFullForm?: boolean;
  hideDescription?: boolean;
}>;
export default WorkflowStepWithActivityForm;
