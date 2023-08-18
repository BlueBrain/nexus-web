import * as React from 'react';
import { Menu, Dropdown } from 'antd';
import addIconClear from '../../../shared/images/addIconClear.svg';

import './AddComponentButton.scss';


const AddComponentButton: React.FC<{
  addNewStep: () => void;
  addDataTable?: () => void;
  addCode?: () => void;
  addDataset?: () => void;
  addInputTable?: () => void;
  addActivityTable?: () => void;
}> = ({
  addNewStep,
  addDataTable,
  addCode,
  addDataset,
  addInputTable,
  addActivityTable,
}) => {
  const menu = (
    <Menu>
      {addInputTable && (
        <Menu.Item onClick={addInputTable}>
          Canvas: Add New Input Table
        </Menu.Item>
      )}
      {addActivityTable && (
        <Menu.Item onClick={addActivityTable}>
          Canvas: Add New Activity Table
        </Menu.Item>
      )}

      <Menu.Item onClick={addNewStep}>Canvas: Add New Step</Menu.Item>
      {addDataTable && (
        <Menu.Item onClick={addDataTable}>Canvas: Add Data Table</Menu.Item>
      )}
      {addCode && (
        <Menu.Item disabled onClick={addCode}>
          Project: Create New Code Resource
        </Menu.Item>
      )}
      {addDataset && (
        <Menu.Item onClick={addDataset}>Project: Add New Dataset</Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="add-component-button">
      <Dropdown overlay={menu} placement="topRight">
        <img className="add-component-button__icon" src={addIconClear} />
      </Dropdown>
    </div>
  );
};

export default AddComponentButton;
