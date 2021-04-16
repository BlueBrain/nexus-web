import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Form, Input, Button, Spin, Checkbox, Row, Col, Select } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { IInstance } from 'react-codemirror2/index';
import { Resource, View, SparqlView } from '@bbp/nexus-sdk';
import { useQuery } from 'react-query';
import ColumnConfig from './ColumnConfig';
import {
  queryES,
  parseESResults,
  querySparql,
} from '../hooks/useAccessDataForTable';
import './EditTableForm.less';

/**
 * isEmptyInput function - checks if a given input empty
 * @param {string}
 * @returns {boolean}
 */
export const isEmptyInput = (value: string) => {
  return value.split(' ').join('') === '';
};

export enum ViewOptions {
  SPARQL_VIEW = 'nxv:defaultSparqlIndex',
  ES_VIEW = 'nxv:defaultElasticSearchIndex',
}

export type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};

export type TableComponent = Resource<{
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;

const PAGES_OPTIONS = [10, 20, 50, 100];

const { Item } = Form;
const { Option } = Select;

const EditTableForm: React.FC<{
  onSave: (data: TableComponent) => void;
  onClose: () => void;
  table: any;
  busy: boolean;
  orgLabel: string;
  projectLabel: string;
}> = ({ onSave, onClose, table, orgLabel, projectLabel, busy }) => {
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

  // Copy for codemirror text editor.
  const [queryCopy, setQueryCopy] = React.useState<string>(dataQuery);

  const [configuration, setConfiguration] = React.useState<
    TableColumn | TableColumn[]
  >(table.configuration);
  const nexus = useNexusContext();

  const updateColumConfig = useQuery(
    [view, dataQuery],
    async () => {
      const viewResource = await nexus.View.get(orgLabel, projectLabel, view);
      if (viewResource['@type']?.includes('ElasticSearchView')) {
        const result = await queryES(
          {},
          nexus,
          orgLabel,
          projectLabel,
          viewResource['@id']
        );

        const { items } = parseESResults(result);
        const mergedItem = items.reduce((result: any, current: any) => {
          return Object.assign(result, current);
        }, {});

        return Object.keys(mergedItem).map(title => ({
          '@type': '',
          name: title,
          format: '',
          enableSearch: false,
          enableSort: false,
          enableFilter: false,
        }));
      }
      const result = await querySparql(nexus, dataQuery, viewResource);

      return result.headerProperties.map(x => ({
        '@type': 'text',
        name: x.title,
        format: '',
        enableSearch: false,
        enableSort: false,
        enableFilter: false,
      }));
    },
    {
      onSuccess: data => {
        setConfiguration(data);
      },
      onError: error => {
        console.error(error);
      },
    }
  );

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
      const data = {
        ...table,
        name,
        description,
        view,
        enableSearch,
        enableInteractiveRows,
        enableDownload,
        enableSave,
        resultsPerPage,
        dataQuery,
        configuration,
      };

      onSave(data);
    }
  };

  const handleQueryChange = (editor: IInstance, data: any, value: string) => {
    setQueryCopy(value);
  };

  const onClickPreview = () => {
    setDataQuery(queryCopy);
  };

  const updateColumnConfig = (name: string, data: any) => {
    if (Array.isArray(configuration)) {
      const currentConfig = configuration;

      const column = currentConfig.find(column => column.name === name);

      const updatedColumn = {
        ...column,
        ...data,
      };

      const columnIndex = currentConfig.findIndex(
        column => column.name === name
      );

      currentConfig[columnIndex] = updatedColumn;

      setConfiguration(currentConfig);
    } else {
      const column = {
        ...configuration,
        ...data,
      };

      setConfiguration(column);
    }
  };

  return (
    <Form className="edit-table-form">
      <h2 className="edit-table-form__title">Edit Table</h2>
      <Spin spinning={busy} tip="Please wait...">
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
            <Select
              value={view}
              style={{ width: 220 }}
              onChange={value => {
                setView(value);
                if (value === ViewOptions.ES_VIEW) {
                  setDataQuery('{}');
                  setQueryCopy('{}');
                } else {
                  setDataQuery(
                    'prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/> SELECT DISTINCT ?self ?s WHERE { ?s nxv:self ?self } LIMIT 21'
                  );
                  setQueryCopy(
                    'prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/> SELECT DISTINCT ?self ?s WHERE { ?s nxv:self ?self } LIMIT 21'
                  );
                }
              }}
            >
              {Object.values(ViewOptions).map(view => (
                <Option value={view}>{view}</Option>
              ))}
            </Select>
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
            <Select
              value={resultsPerPage}
              onChange={value => {
                setResultsPerPage(value);
              }}
            >
              {PAGES_OPTIONS.map(pages => (
                <Option value={pages}>{pages}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <div className="edit-table-form__query">
          <h3>Query</h3>
          <CodeMirror
            value={queryCopy}
            autoCursor={true}
            options={{
              mode: { name: 'javascript', json: true },
              readOnly: false,
              theme: 'base16-light',
              placeholder: 'Enter a valid SPARQL query',
              lineNumbers: true,
              viewportMargin: Infinity,
            }}
            onBeforeChange={(editor, data, value) => {
              handleQueryChange(editor, data, value);
            }}
          />
        </div>
        <div>
          {updateColumConfig.isLoading ? (
            <Spin></Spin>
          ) : (
            <Button onClick={onClickPreview} type="primary">
              Preview
            </Button>
          )}
        </div>
        <div className="edit-table-form__config">
          <h3>Columns configuration</h3>
          {!updateColumConfig.isLoading ? (
            configuration ? (
              Array.isArray(configuration) ? (
                configuration.map((column: TableColumn) => (
                  <ColumnConfig
                    column={column}
                    onChange={updateColumnConfig}
                    key={column.name}
                  />
                ))
              ) : (
                <ColumnConfig
                  column={configuration}
                  onChange={updateColumnConfig}
                />
              )
            ) : null
          ) : (
            <Spin />
          )}
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
      </Spin>
    </Form>
  );
};

export default EditTableForm;
