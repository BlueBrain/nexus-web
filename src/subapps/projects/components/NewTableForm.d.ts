import * as React from 'react';
import './NewTableForm.less';
declare const NewTableForm: React.FC<{
  onSave: (name: string, description: string) => void;
  onClose: () => void;
  busy: boolean;
}>;
export default NewTableForm;
