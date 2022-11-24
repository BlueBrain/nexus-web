import * as React from 'react';
import './AddComponentButton.less';
declare const AddComponentButton: React.FC<{
  addNewStep: () => void;
  addDataTable?: () => void;
  addCode?: () => void;
  addDataset?: () => void;
  addInputTable?: () => void;
  addActivityTable?: () => void;
}>;
export default AddComponentButton;
