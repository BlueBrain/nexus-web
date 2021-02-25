import * as React from 'react';
import { Form, Input, Button, Spin } from 'antd';

import { isEmptyInput } from '../utils';

const { Item } = Form;

import './EditTableForm.less';

const EditTableForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>('');

  const onChangeName = (event: any) => {
    setName(event.target.value);
    setNameError(false);
  };

  const onChangeDescription = (event: any) => {
    setDescription(event.target.value);
  };

  const onClickSave = () => {
    if (isEmptyInput(name)) {
      setNameError(true);
    } else {
      onSave();
    }
  };

  return (
    <Form className="edit-table-form">
      <h2 className="edit-table-form__title">Edit Table</h2>
      <Item
        label="Table Name *"
        validateStatus={nameError ? 'error' : ''}
        help={nameError && 'Please enter a table name'}
      >
        <Input value={name} onChange={onChangeName} placeholder="Table name" />
      </Item>
      <Item label="Description">
        <Input.TextArea
          value={description}
          onChange={onChangeDescription}
          placeholder="Table description"
        />
      </Item>
      <Item label="View">View Dropdown</Item>
      <Item label="Actions">Checkboxes</Item>
      <Item label="Results per page">Dropdown</Item>
      <Item label="Query">Codemirror</Item>
      <Button onClick={() => {}} type="primary">
        Preview
      </Button>
      <Item label="Column configuration">Codemirror</Item>
      <div className="edit-table-form__buttons">
        <Button style={{ margin: '10px' }} onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onClickSave} type="primary">
          Save
        </Button>
      </div>

      <p>
        <em>* Mandatory field</em>
      </p>
    </Form>
  );
};

export default EditTableForm;
