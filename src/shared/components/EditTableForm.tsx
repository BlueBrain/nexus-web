import { View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Tooltip,
} from 'antd';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sparql/sparql';
import 'codemirror/theme/base16-light.css';
import * as React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { useQuery } from 'react-query';
import { FUSION_TABLE_CONTEXT } from '../../subapps/projects/fusionContext';
import {
  TableColumn,
  TableResource,
  UnsavedTableResource,
} from '../containers/DataTableContainer';
import {
  parseESResults,
  queryES,
  querySparql,
} from '../hooks/useAccessDataForTable';
import ColumnConfig from './ColumnConfig';
import './EditTableForm.less';
import { isNil, isObject } from 'lodash';
import { ErrorComponent } from './ErrorComponent';

const DEFAULT_SPARQL_QUERY =
  'prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/> \nSELECT DISTINCT ?self ?s WHERE { ?s nxv:self ?self } LIMIT 20';
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
  onError: (err: Error | null) => void;
  table?: TableResource;
  busy: boolean;
  orgLabel: string;
  projectLabel: string;
  formName?: string;
  options?: { disableDelete: boolean };
}> = ({
  onSave,
  onClose,
  onError,
  table,
  orgLabel,
  projectLabel,
  busy,
  formName = 'Edit',
}) => {
  // state
  const [name, setName] = React.useState<string | undefined>(table?.name);
  const [nameError, setNameError] = React.useState<boolean>(false);
  const [viewError, setViewError] = React.useState<boolean>(false);
  const [tableDataError, setTableDataError] = React.useState<null | Error>(
    null
  );
  const [projectionError, setProjectionError] = React.useState<boolean>(false);
  const [description, setDescription] = React.useState<string>(
    table?.description || ''
  );
  const [viewName, setViewName] = React.useState<string | undefined>(
    table?.view
  );
  const [view, setView] = React.useState<View>();
  const [mode, setMode] = React.useState<any>({
    name: 'javascript',
    json: true,
  });
  const [placeHolder, setPlaceHolder] = React.useState<string>(
    'Enter a valid ElasticSearch query'
  );

  const [preview, setPreview] = React.useState<boolean>(true);
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
  const [queryCopy, setQueryCopy] = React.useState<string>(
    table ? table.dataQuery : ''
  );

  const [configuration, setConfiguration] = React.useState<
    TableColumn | TableColumn[]
  >(table?.configuration || []);

  const [projectionId, setProjectionId] = React.useState<string>();

  /* Available views for project */
  const [availableViews, setAvailableViews] = React.useState<View[]>();
  // call backs.
  const nexus = useNexusContext();
  const initializeAvailableViews = async () =>
    setAvailableViews((await nexus.View.list(orgLabel, projectLabel))._results);

  const asyncCallToSetView = async (viewId: string) => {
    const viewDetails = await getView(viewId);
    const placeholder = viewDetails['@type']?.includes('ElasticSearchView')
      ? 'Enter a valid ElasticSearch query'
      : 'Enter a valid SPARQL query';
    setView(viewDetails);
    setMode(
      viewDetails['@type']?.includes('ElasticSearchView')
        ? {
            name: 'javascript',
            json: true,
          }
        : { name: 'sparql' }
    );

    setPlaceHolder(placeholder);
    setProjectionId(undefined);
    return viewDetails;
  };

  const getView = async (viewId: string) =>
    await nexus.View.get(orgLabel, projectLabel, encodeURIComponent(viewId));

  const setQueries = React.useCallback(
    (viewDetails: View) => {
      const viewTypes = [viewDetails['@type']].flat();
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
        (projection &&
          projection['@type'].includes('ElasticSearchProjection')) ||
        projectionId === 'All_ElasticSearchProjection'
      ) {
        setDataQuery(DEFAULT_ES_QUERY);
        setQueryCopy(DEFAULT_ES_QUERY);
      }
    },
    [projectionId]
  );

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
        let result;

        try {
          result = await queryES(
            dataQuery,
            nexus,
            orgLabel,
            projectLabel,
            viewResource['@id'],
            !!projectionId,
            projectionId === 'All_ElasticSearchProjection'
              ? undefined
              : projectionId
          );
          // tslint:disable-next-line
        } catch (error) {
          const anyerror = error as any; // Hack until we migrate from tslint to typescript-eslint.
          const message =
            anyerror?.reason ??
            anyerror?.message ??
            anyerror?.name ??
            'Failed to fetch elastic search table';
          const cause = anyerror.cause ?? anyerror?.details;
          // @ts-ignore - TODO: Remove ts-ignore once we support es2022 (or up).
          throw new Error(message, { cause });
        }

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
      )
        .then(result => {
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
        })
        .catch(error => {
          // Sometimes delta's error message can be in `name` or `reason` field.
          const message =
            error.message ??
            error.reason ??
            error.name ??
            'Failed to fetch sparql table';
          // @ts-ignore TODO: Remove ts-ignore when we support es2022 for ts.
          throw new Error(message, {
            cause: error.cause ?? error.details ?? error.stack,
          });
        });

      return result;
    },
    {
      onSuccess: data => {
        updateTableDataError(null);
        if (
          isNil(configuration) ||
          (configuration as TableColumn[]).length === 0
        ) {
          setConfiguration(data);
        }
      },
      onError: (error: Error) => {
        updateTableDataError(error);
      },
      enabled: preview,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    }
  );

  const onChangeName = (event: any) => {
    setName(event.target.value);
    setNameError(false);
  };

  const onChangeDescription = (event: any) => {
    setDescription(event.target.value);
  };

  const updateTableDataError = (error: Error | null) => {
    setTableDataError(error);
    onError(error); // Notify parent of EditTableForm of the error.
  };

  const onClickSave = async () => {
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

  const onChangeViewDropDown = async (value: string) => {
    value && setViewName(value);
    setViewError(false);
    const viewDetails = await asyncCallToSetView(value);
    setQueries(viewDetails);
  };

  const onClickPreview = () => {
    setPreview(true);
    setDataQuery(queryCopy);
  };

  const updateColumnConfigArray = React.useCallback(
    (name: string, data: any) => {
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

  const updateColumnConfig = React.useCallback(
    (name: string, data: any) => {
      const updatedColumn = {
        ...configuration,
        ...data,
      };

      setConfiguration(updatedColumn);
    },
    [configuration]
  );

  const renderColumnConfig = React.useCallback(() => {
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
  }, [configuration, queryColumnConfig, updateColumnConfigArray]);

  // effects
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
              <Input
                aria-label="Label"
                value={name}
                onChange={onChangeName}
                placeholder="Name"
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
                aria-label="View"
                data-testid="view-selector"
                style={{ width: 650 }}
                onChange={value => {
                  onChangeViewDropDown(value);
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
        <div className="edit-table-form__query">
          <h3>Query</h3>
          <div className="code">
            <CodeMirror
              autoCursor={true}
              autoScroll={true}
              value={queryCopy}
              options={{
                mode,
                theme: 'base16-light',
                lineNumbers: true,
                lineWrapping: true,
                placeholder: placeHolder,
              }}
              onBeforeChange={(editor, data, value) => {
                setPreview(false);
                handleQueryChange(value);
              }}
            />
          </div>
        </div>
        <div>
          {queryColumnConfig.isLoading ? (
            <Spin></Spin>
          ) : (
            <Button onClick={onClickPreview} type="primary">
              Configure Columns
            </Button>
          )}
        </div>
        <div className="edit-table-form__config">
          <h3>Columns configuration</h3>

          {renderColumnConfig()}
        </div>
        {tableDataError && (
          <ErrorComponent
            message={tableDataError.message}
            details={
              // @ts-ignore - TODO: Remove ts-ignore once we support es2022 in ts.
              (tableDataError.cause as any)?.details
            }
          />
        )}
        <div className="edit-table-form__buttons">
          <Button style={{ margin: '10px' }} onClick={onClose}>
            Cancel
          </Button>
          <Tooltip
            placement="topLeft"
            title={
              preview
                ? 'Save Changes'
                : 'You have to click on configure columns to enable save'
            }
          >
            <Button onClick={onClickSave} type="primary" disabled={!preview}>
              Save
            </Button>
          </Tooltip>
        </div>
        <p>
          <em>* Mandatory field</em>
        </p>
      </Spin>
    </Form>
  );
};

export default EditTableForm;
