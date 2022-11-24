import * as React from 'react';
import './ProjectForm.less';
export interface PrefixMappingGroupInputState {
  prefix: string;
  namespace: string;
}
export interface ProjectFormProps {
  project?: {
    _label: string;
    _rev: number;
    description?: string;
    base?: string;
    vocab?: string;
    apiMappings?: PrefixMappingGroupInputState[];
  };
  busy?: boolean;
  onSubmit?(project: ProjectFormProps['project']): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}
/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
declare const ProjectForm: React.FunctionComponent<ProjectFormProps>;
export default ProjectForm;
