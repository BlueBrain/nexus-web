import './NewTableForm.scss';

import { Button, Form, Input, Spin } from 'antd';
import * as React from 'react';

import { isEmptyInput } from '../utils';

const { Item } = Form;

const NewTableForm: React.FC<{
  onSave: (name: string, description: string) => void;
  onClose: () => void;
  busy: boolean;
}> = ({ onSave, onClose, busy }) => {
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
      onSave(name, description);
    }
  };

  return (
    <Form className="new-table-form">
      <h2 className="new-table-form__title">Create New Table</h2>
      <Spin spinning={busy} tip="Please wait...">
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
        <div className="new-table-form__buttons">
          <Button style={{ margin: '10px' }} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClickSave} type="primary">
            Save
          </Button>
        </div>
        <p>
          <em>* Mandatory field</em>
        </p>
      </Spin>
    </Form>
  );
};

export default NewTableForm;
