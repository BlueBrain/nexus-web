import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { Form, Input, Button, Spin, Checkbox, Row, Col, Select } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { View } from '@bbp/nexus-sdk';
import { useQuery } from 'react-query';
import ColumnConfig from './ColumnConfig';
import {
  queryES,
  parseESResults,
  querySparql,
} from '../hooks/useAccessDataForTable';
import './EditTableForm.less';
import {
  TableResource,
  TableColumn,
  UnsavedTableResource,
} from '../containers/DataTableContainer';
import { FUSION_TABLE_CONTEXT } from '../../subapps/projects/fusionContext';

const DEFAULT_SPARQL_QUERY =
  'prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/> SELECT DISTINCT ?self ?s WHERE { ?s nxv:self ?self } LIMIT 20';
const DEFAULT_ES_QUERY = '{}';

/**
 * isEmptyInput function - checks if a given input empty
 * @param {string}
 * @returns {boolean}
 */
export const isEmptyInput = (value: string) => {
  return value.split(' ').join('') === '';
};

export type Projection =
  | {
      '@id':
        | string
        | (string & ['SparqlView', 'View'])
        | (string & ['AggregatedElasticSearchView', 'View'])
        | (string & ['AggregatedSparqlView', 'View'])
        | undefined;
      '@type':
        | string
        | string[]
        | ((string | string[] | undefined) & ['ElasticSearchView', 'View'])
        | ((string | string[] | undefined) & ['CompositeView', 'Beta', 'View'])
        | undefined;
    }
  | undefined;

const PAGES_OPTIONS = [5, 10, 20, 50, 100];

const { Item } = Form;
const { Option } = Select;

const EditTableForm: React.FC<{
  onSave: (data: TableResource | UnsavedTableResource) => void;
  onClose: () => void;
  table?: TableResource;
  busy: boolean;
  orgLabel: string;
  projectLabel: string;
  formName?: string;
  options?: { disableDelete: boolean };
}> = ({
  onSave,
  onClose,
  table,
  orgLabel,
  projectLabel,
  busy,
  formName = 'Edit',
}) => {
  const [name, setName] = React.useState<string | undefined>(table?.name);
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [viewError, setViewError] = React.useState<boolean>(false);
  const [projectionError, setProjectionError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>(
    table?.description || ''
  );
  const [viewName, setViewName] = React.useState<string | undefined>(
    table?.view
  );
  const [view, setView] = React.useState<View>();

  const [preview, setPreview] = React.useState<boolean>(false);
  const [enableSearch, setEnableSearch] = React.useState<boolean>(
    table ? table.enableSearch : true
  );

  const [enableInteractiveRows, setEnableInteractiveRows] = React.useState<
    boolean
  >(table ? table.enableInteractiveRows : true);
  const [enableDownload, setEnableDownload] = React.useState<boolean>(
    table ? table.enableDownload : true
  );
  const [enableSave, setEnableSave] = React.useState<boolean>(
    table ? table.enableSave : true
  );
  const [resultsPerPage, setResultsPerPage] = React.useState<number>(
    table ? table.resultsPerPage : PAGES_OPTIONS[0]
  );
  const [dataQuery, setDataQuery] = React.useState<string>(
    table ? table.dataQuery : ''
  );

  // Copy for codemirror text editor.
  const [queryCopy, setQueryCopy] = React.useState<string>(dataQuery);

  const [configuration, setConfiguration] = React.useState<
    TableColumn | TableColumn[]
  >(table?.configuration || []);

  const nexus = useNexusContext();

  const [projectionId, setProjectionId] = React.useState<string>();

  /* Available views for project */
  const [availableViews, setAvailableViews] = React.useState<View[]>();

  const initializeAvailableViews = async () =>
    setAvailableViews((await nexus.View.list(orgLabel, projectLabel))._results);

  // set the available views on load and set view to that specified on TableResource
  React.useEffect(() => {
    (async () => {
      await initializeAvailableViews();
      table && (await asyncCallToSetView(table.view));

      if (table?.projection) {
        if (table.projection['@id']) {
          setProjectionId(table.projection['@id']);
        } else {
          /* 
          when no projection id it means search all of the
          specified projection type
          */
          setProjectionId(`All_${table.projection['@type']}`);
        }
      } else {
        setProjectionId(undefined);
      }
    })();
  }, []);

  const asyncCallToSetView = async (viewId: string) => {
    const viewDetails = await getView(viewId);
    setView(viewDetails);
    setProjectionId(undefined);
  };

  const getView = async (viewId: string) =>
    await nexus.View.get(orgLabel, projectLabel, encodeURIComponent(viewId));

  /* when the selected view details changes, set the default query appropriately */
  React.useEffect(() => {
    const viewTypes = [view?.['@type']].flat();
    const projection =
      view &&
      view.projections &&
      (view.projections as {
        '@id': string;
        '@type': string;
      }[])
        .map(o => ({ '@id': o['@id'], '@type': o['@type'] }))
        .find(o => o['@id'] === projectionId);

    if (
      viewTypes.includes('SparqlView') ||
      viewTypes.includes('AggregateSparqlView') ||
      (projection && projection['@type'].includes('SparqlProjection')) ||
      projectionId === 'All_SparqlProjection'
    ) {
      setDataQuery(DEFAULT_SPARQL_QUERY);
      setQueryCopy(DEFAULT_SPARQL_QUERY);
    } else if (
      viewTypes.includes('ElasticSearchView') ||
      viewTypes.includes('AggregateElasticSearchView') ||
      (projection && projection['@type'].includes('ElasticSearchProjection')) ||
      projectionId === 'All_ElasticSearchProjection'
    ) {
      setDataQuery(DEFAULT_ES_QUERY);
      setQueryCopy(DEFAULT_ES_QUERY);
    }
  }, [view, projectionId]);

  const queryColumnConfig = useQuery(
    [viewName, dataQuery, projectionId],
    async (): Promise<TableColumn[]> => {
      if (!viewName || !dataQuery) return [] as TableColumn[];

      const viewResource = await nexus.View.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(viewName)
      );

      const projection =
        view &&
        view.projections &&
        (view.projections as {
          '@id': string;
          '@type': string;
        }[])
          .map(o => ({ '@id': o['@id'], '@type': o['@type'] }))
          .find(o => o['@id'] === projectionId);
      if (
        view &&
        (view['@type']?.includes('ElasticSearchView') ||
          view['@type']?.includes('AggregateElasticSearchView') ||
          projection?.['@type'].includes('ElasticSearchProjection') ||
          projectionId === 'All_ElasticSearchProjection')
      ) {
        const result = await queryES(
          JSON.parse(dataQuery),
          nexus,
          orgLabel,
          projectLabel,
          viewResource['@id'],
          !!projectionId,
          projectionId === 'All_ElasticSearchProjection'
            ? undefined
            : projectionId
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
      const result = await querySparql(
        nexus,
        dataQuery,
        viewResource,
        !!projectionId,
        projectionId === 'All_SparqlProjection' ? undefined : projectionId
      );

      return result.headerProperties
        .sort((a, b) => {
          return a.title > b.title ? 1 : -1;
        })
        .map(x => ({
          '@type': 'text',
          name: x.dataIndex,
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
      enabled: preview,
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
    if (
      !name ||
      isEmptyInput(name) ||
      !viewName ||
      (view && view.projections && !projectionId)
    ) {
      if (!name || isEmptyInput(name)) {
        setNameError(true);
      }
      if (!viewName) {
        setViewError(true);
      }
      if (view && view.projections && !projectionId) {
        setProjectionError(true);
      }

      return;
    }

    let projection =
      view &&
      view.projections &&
      (view.projections as {
        '@id'?: string;
        '@type': string;
      }[])
        .map(o => ({ '@id': o['@id'], '@type': o['@type'] }))
        .find(o => o['@id'] === projectionId);

    // No @id when we search all projections of a particular type
    if (projectionId === 'All_ElasticSearchProjection') {
      projection = { '@type': 'ElasticSearchProjection' };
    } else if (projectionId === 'All_SparqlProjection') {
      projection = { '@type': 'ElasticSearchProjection' };
    }

    let data: any;
    if (table) {
      data = {
        ...table,
        name,
        description,
        projection,
        enableSearch,
        enableInteractiveRows,
        enableDownload,
        enableSave,
        resultsPerPage,
        dataQuery,
        configuration,
        view: viewName,
      };
    } else {
      data = {
        name,
        description,
        projection,
        enableSearch,
        enableInteractiveRows,
        enableDownload,
        enableSave,
        resultsPerPage,
        dataQuery,
        configuration,
        '@type': 'FusionTable',
        '@context': FUSION_TABLE_CONTEXT['@id'],
        view: viewName,
      };
    }
    onSave(data);
  };

  const handleQueryChange = (value: string) => {
    setQueryCopy(value);
  };

  const onClickPreview = () => {
    setPreview(true);
    setDataQuery(queryCopy);
  };

  const updateColumnConfigArray = React.useMemo(
    () => (name: string, data: any) => {
      const currentConfig = [...(configuration as TableColumn[])];

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
    },
    [configuration]
  );

  const updateColumnConfig = React.useMemo(
    () => (name: string, data: any) => {
      const updatedColumn = {
        ...configuration,
        ...data,
      };

      setConfiguration(updatedColumn);
    },
    [configuration]
  );

  const renderColumnConfig = React.useMemo(
    () => () => {
      return Array.isArray(configuration) ? (
        configuration.map((column: TableColumn) => {
          return (
            <ColumnConfig
              column={column}
              onChange={updateColumnConfigArray}
              key={column.name}
            />
          );
        })
      ) : (
        <ColumnConfig column={configuration} onChange={updateColumnConfig} />
      );
    },
    [configuration, queryColumnConfig, updateColumnConfigArray]
  );

  return (
    <Form className="edit-table-form">
      <h2 className="edit-table-form__title">{formName}</h2>
      <Spin spinning={busy} tip="Please wait...">
        <Row>
          <Col xs={6} sm={6} md={6}>
            <h3>Name*</h3>
          </Col>
          <Col xs={12} sm={12} md={12}>
            <Item
              validateStatus={nameError ? 'error' : ''}
              help={nameError && 'Please enter a name'}
            >
              <Input value={name} onChange={onChangeName} placeholder="Name" />
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
              placeholder="Description"
            />
          </Col>
        </Row>
        <Row style={{ marginTop: '24px' }}>
          <Col xs={6} sm={6} md={6}>
            <h3>View</h3>
          </Col>
          <Col xs={12} sm={12} md={12}>
            <Item
              validateStatus={viewError ? 'error' : ''}
              help={viewError && 'Please select a view'}
            >
              <Select
                value={viewName}
                style={{ width: 650 }}
                onChange={value => {
                  value && setViewName(value);
                  setViewError(false);
                  asyncCallToSetView(value);
                }}
              >
                {availableViews &&
                  availableViews.map(view => (
                    <Option key={view['@id']} value={view['@id']}>
                      {view['@id']}
                    </Option>
                  ))}
              </Select>
            </Item>
          </Col>
        </Row>
        {view && view.projections && (
          <Row>
            <Col xs={6} sm={6} md={6}>
              <h3>Projection</h3>
            </Col>
            <Col>
              <Item
                validateStatus={projectionError ? 'error' : ''}
                help={projectionError && 'Please select a projection'}
              >
                <Select
                  style={{ width: 650 }}
                  value={projectionId}
                  onChange={value => {
                    setProjectionId(value);
                    setProjectionError(false);
                  }}
                >
                  {(view.projections as {
                    '@id': string;
                    '@type': string;
                  }[]).some(o => o['@type'] === 'ElasticSearchProjection') && (
                    <Option
                      key="All_ElasticSearchProjection"
                      value="All_ElasticSearchProjection"
                    >
                      All ElasticSearch
                    </Option>
                  )}
                  {(view.projections as {
                    '@id': string;
                    '@type': string;
                  }[]).some(o => o['@type'] === 'SparqlProjection') && (
                    <Option
                      key="All_SparqlProjection"
                      value="All_SparqlProjection"
                    >
                      All Sparql
                    </Option>
                  )}
                  {(view.projections as {
                    '@id': string;
                    '@type': string;
                  }[]).map(o => (
                    <Option key={o['@id']} value={o['@id']}>
                      {o['@id']}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
        )}
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
                <Option key={pages} value={pages}>
                  {pages}
                </Option>
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
              placeholder: '',
              lineNumbers: true,
              viewportMargin: Infinity,
            }}
            onBeforeChange={(editor, data, value) => {
              handleQueryChange(value);
            }}
          />
        </div>
        <div>
          {queryColumnConfig.isLoading ? (
            <Spin></Spin>
          ) : (
            <Button onClick={onClickPreview} type="primary">
              Preview
            </Button>
          )}
        </div>
        <div className="edit-table-form__config">
          <h3>Columns configuration</h3>

          {renderColumnConfig()}
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
