import * as React from 'react';
import { Menu, Dropdown } from 'antd';

import './AddComponentButton.less';

const addIcon = require('../../../shared/images/addIcon.svg');

const AddComponentButton: React.FC<{
  addNewStep: () => void;
  addDataTable: () => void;
  addCode: () => void;
  addDataset: () => void;
}> = ({ addNewStep, addDataTable, addCode, addDataset }) => {
  const menu = (
    <Menu>
      <Menu.Item onClick={addNewStep}>Canvas: Add a New Step</Menu.Item>
      <Menu.Item disabled onClick={addDataTable}>
        Canvas: Add a Data Table - coming soon
      </Menu.Item>
      <Menu.Item disabled onClick={addCode}>
        Project: Create a New Code Resource
      </Menu.Item>
      <Menu.Item disabled onClick={addDataset}>
        Project: Create a New Dataset Resource
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="add-component-button">
      <Dropdown overlay={menu}>
        <img className="add-component-button__icon" src={addIcon} />
      </Dropdown>
    </div>
  );
};

export default AddComponentButton;
