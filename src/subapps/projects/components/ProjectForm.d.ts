import * as React from 'react';
import './ProjectForm.less';
export declare type ProjectMetadata = {
  name: string;
  description: string;
  dueDate: string;
  visibility?: string;
  topic?: string;
  hypotheses?: string;
  goals?: string;
  questions?: string;
  type?: string;
};
declare const ProjectForm: React.FC<{
  onClickCancel(): void;
  onSubmit(data: ProjectMetadata): void;
  busy: boolean;
  project?: ProjectMetadata;
  isFullForm?: boolean;
}>;
export default ProjectForm;
