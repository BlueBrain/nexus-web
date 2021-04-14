import * as React from 'react';
import { Menu, Dropdown } from 'antd';

import './AddComponentButton.less';

const addIcon = require('../../../shared/images/addIcon.svg');

const AddComponentButton: React.FC<{}> = () => {
  const onClickAddNewStep = () => {
    console.log('clicked...');
  };

  const onClickAddDataTable = () => {
    console.log('clicked... onClickAddDataTable');
  };

  const onClickAddCode = () => {
    console.log('clicked... onClickAddCode');
  };

  const onClickAddDataset = () => {
    console.log('clicked... onClickAddDataset');
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={onClickAddNewStep}>Canvas: Add a New Step</Menu.Item>
      <Menu.Item onClick={onClickAddDataTable}>
        Canvas: Add a Data Table
      </Menu.Item>
      <Menu.Item onClick={onClickAddCode}>
        Project: Create a New Code Resource
      </Menu.Item>
      <Menu.Item onClick={onClickAddDataset}>
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
