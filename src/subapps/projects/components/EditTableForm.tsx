import * as React from 'react';
import {
  Form,
  Input,
  Button,
  Spin,
  Dropdown,
  Menu,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Controlled as CodeMirror } from 'react-codemirror2';

import { isEmptyInput } from '../utils';
import './EditTableForm.less';

export enum ColumnTypes {
  DATE = 'date',
  RESOURCE = 'resource',
  TEXT = 'text',
  URL = 'url',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  IMAGE = 'image',
}

const { Item } = Form;

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

  const onClickPreview = () => {
    // fetch new query
    // update config
  };

  return (
    <Form className="edit-table-form">
      <h2 className="edit-table-form__title">Edit Table</h2>
      <Row>
        <Col xs={6} sm={6} md={6}>
          <h3>Name*</h3>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Item
            validateStatus={nameError ? 'error' : ''}
            help={nameError && 'Please enter a table name'}
          >
            <Input
              value={name}
              onChange={onChangeName}
              placeholder="Table name"
            />
          </Item>
        </Col>
      </Row>
      <Row>
        <Col xs={6} sm={6} md={6}>
          <h3>Description</h3>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Input.TextArea
            value={description}
            onChange={onChangeDescription}
            placeholder="Table description"
          />
        </Col>
      </Row>
      <Row style={{ marginTop: '24px' }}>
        <Col xs={6} sm={6} md={6}>
          <h3>View</h3>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Dropdown overlay={viewOptions}>
            <Button>
              {view} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <div className="edit-table-form__actions">
        <h3 className="edit-table-form__actions-title">Actions</h3>
        <div className="edit-table-form__action-items">
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
      </div>
      <Row>
        <Col xs={6} sm={6} md={6}>
          <h3>Results per page</h3>
        </Col>
        <Col>
          <Dropdown overlay={viewOptions}>
            <Button>
              {resultsPerPage} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <div className="edit-table-form__query">
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
      </div>

      <div>
        <Button onClick={onClickPreview} type="primary">
          Preview
        </Button>
      </div>
      <div className="edit-table-form__config">
        <h3>Columns configuration</h3>
        {table.configuration &&
          table.configuration.map((column: any) => (
            <div
              className="edit-table-form__column"
              key={`column-${column.name}`}
            >
              <Row style={{ margin: '15px 0' }}>
                <Col xs={8} sm={8} md={8}>
                  <h4>{column.name}</h4>
                  <Checkbox checked={column.enableSearch}>
                    Enable Search
                  </Checkbox>
                  <br />
                  <Checkbox checked={column.enableSort}>Enable Sort</Checkbox>
                  <br />
                  <Checkbox checked={column.enableFilter}>
                    Enable Filter
                  </Checkbox>
                </Col>
                <Col xs={16} sm={16} md={16}>
                  Column Type{' '}
                  <Dropdown
                    overlay={
                      <Menu
                        selectedKeys={[`${column.format}`]}
                        onClick={() => {}}
                      >
                        {Object.values(ColumnTypes).map(type => (
                          <Menu.Item key={type}>{type}</Menu.Item>
                        ))}
                      </Menu>
                    }
                  >
                    <Button>
                      {column.format} <DownOutlined />
                    </Button>
                  </Dropdown>
                </Col>
              </Row>
            </div>
          ))}
      </div>
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
