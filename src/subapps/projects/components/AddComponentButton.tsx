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
    <Menu
      items={[
        ...(addInputTable
          ? [
              {
                key: 'add_input_table',
                label: 'Canvas: Add New Input Table',
                onClick: () => addInputTable(),
              },
            ]
          : []),
        ...(addActivityTable
          ? [
              {
                key: 'add_activity_table',
                label: 'Canvas: Add New Activity Table',
                onClick: () => addActivityTable(),
              },
            ]
          : []),
        {
          key: 'add_new_step',
          label: 'Canvas: Add New Step',
          onClick: () => addNewStep(),
        },
        ...(addDataTable
          ? [
              {
                key: 'add_data_table',
                label: 'Canvas: Add Data Table',
                onClick: () => addDataTable(),
              },
            ]
          : []),
        ...(addCode
          ? [
              {
                key: 'add_code',
                label: 'Project: Create New Code Resource',
                onClick: () => addCode(),
              },
            ]
          : []),
        ...(addDataset
          ? [
              {
                key: 'add_new_dataset',
                label: 'Project: Add New Dataset',
                onClick: () => addDataset(),
              },
            ]
          : []),
      ]}
    />
  );

  return (
    <div className="add-component-button">
      <Dropdown dropdownRender={() => menu} placement="topRight">
        <img className="add-component-button__icon" src={addIconClear} />
      </Dropdown>
    </div>
  );
};

export default AddComponentButton;
