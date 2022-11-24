import * as React from 'react';
import './LinkActivityForm.less';
declare const LinkActivityForm: React.FC<{
  activity: {
    name?: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
    resourceType: string;
  };
  stepsList: {
    id: string;
    name: string;
    parentSteps: {
      id: string;
      name: string;
    }[];
  }[];
  onSubmit: (value: string) => void;
  onCancel: () => void;
}>;
export default LinkActivityForm;
