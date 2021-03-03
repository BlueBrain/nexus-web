import * as React from 'react';
import { Form, Input, Button, Spin, Dropdown, Menu, Checkbox } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Controlled as CodeMirror } from 'react-codemirror2';

import { isEmptyInput } from '../utils';

const { Item } = Form;

import './EditTableForm.less';

const EditTableForm: React.FC<{
  onSave: () => void;
  onClose: () => void;
  table: any;
}> = ({ onSave, onClose, table }) => {
  const [name, setName] = React.useState<string>(table.name);
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>(
    table.description
  );
  const [view, setView] = React.useState<string>(table.view);
  const [enableSearch, setEnableSearch] = React.useState<boolean>(
    table.enableSearch
  );
  const [enableInteractiveRows, setEnableInteractiveRows] = React.useState<
    boolean
  >(table.enableInteractiveRows);
  const [enableDownload, setEnableDownload] = React.useState<boolean>(
    table.enableDownload
  );
  const [enableSave, setEnableSave] = React.useState<boolean>(table.enableSave);
  const [resultsPerPage, setResultsPerPage] = React.useState<number>(
    table.resultsPerPage
  );
  const [dataQuery, setDataQuery] = React.useState<string>(table.dataQuery);
  const [showColumnConfiguration, setShowColumnConfiguration] = React.useState<
    boolean
  >(false);

  const viewOptions = (
    <Menu selectedKeys={['1']} onClick={() => {}}>
      <Menu.Item key="1">1st menu item</Menu.Item>
      <Menu.Item key="2">2nd menu item</Menu.Item>
      <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
  );

  console.log('table', table);

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

  const handleQueryChange = () => {};

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
      <h3>View</h3>
      <Dropdown overlay={viewOptions}>
        <Button>
          {view} <DownOutlined />
        </Button>
      </Dropdown>
      <div>
        <h3>Actions</h3>
        <Checkbox
          onChange={() => setEnableSearch(!enableSearch)}
          checked={enableSearch}
        >
          Enable Local Search
        </Checkbox>
        <br />
        <Checkbox
          onChange={() => setEnableInteractiveRows(!enableInteractiveRows)}
          checked={enableInteractiveRows}
        >
          Interactive Row
        </Checkbox>
        <br />
        <Checkbox
          onChange={() => setEnableDownload(!enableDownload)}
          checked={enableDownload}
        >
          Enable 'Download as CSV'
        </Checkbox>
        <br />
        <Checkbox
          onChange={() => setEnableSave(!enableSave)}
          checked={enableSave}
        >
          Enable 'Save to Data Cart'
        </Checkbox>
        <br />
      </div>
      <Item label="Results per page">
        <Dropdown overlay={viewOptions}>
          <Button>
            {resultsPerPage} <DownOutlined />
          </Button>
        </Dropdown>
      </Item>
      <h3>Query</h3>
      <CodeMirror
        value={dataQuery}
        options={{
          mode: { name: 'sparql' },
          theme: 'base16-light',
          placeholder: 'Enter a valid SPARQL query',
          lineNumbers: true,
          viewportMargin: Infinity,
        }}
        onBeforeChange={handleQueryChange}
      />
      <div>
        <Button
          onClick={() => {
            setShowColumnConfiguration(true);
          }}
          type="primary"
        >
          Preview
        </Button>
      </div>
      {showColumnConfiguration && (
        <div>
          <h3>Column configuration</h3>
        </div>
      )}
      <div className="edit-table-form__buttons">
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
    </Form>
  );
};

export default EditTableForm;
