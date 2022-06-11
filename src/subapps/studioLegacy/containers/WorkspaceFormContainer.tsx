import * as React from 'react';
import { labelOf } from '../../../shared/utils';
import {
  Resource,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  DEFAULT_SPARQL_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import {
  Alert,
  Input,
  Form,
  Modal,
  Select,
  Button,
  Transfer,
  message,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';

type NexusSparqlError = {
  reason: string;
};

type dashboard = { dashboard: string; view: string };

const DASHBOARD_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard';

const SPARQL_VIEW_TYPE =
  'https://bluebrain.github.io/nexus/vocabulary/SparqlView';

const ES_VIEW_TYPE =
  'https://bluebrain.github.io/nexus/vocabulary/ElasticSearchView';
const VIEW_TYPE = 'https://bluebrain.github.io/nexus/vocabulary/View';
const AGGREGATE_VIEW_TYPE =
  'https://bluebrain.github.io/nexus/vocabulary/AggregateSparqlView';
const RESULTS_SIZE = 10000;

type WorkspaceFormProps = {
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  onCancel: () => void;
  onSuccess?: () => void;
};

const SelectViews: React.FunctionComponent<{
  views: Resource[];
  selectedView: string;
  setView: (view: string) => void;
}> = ({ selectedView, views, setView }) => {
  const { Option } = Select;
  const viewOptions: any[] = views.map(d => d['@id']);

  return (
    <>
      <Select
        onChange={(value: string) => {
          setView(value);
        }}
        value={labelOf(selectedView)}
      >
        {viewOptions.map((d, index) => {
          return (
            <Option key={index.toString()} value={d}>
              {labelOf(d)}
            </Option>
          );
        })}
      </Select>
    </>
  );
};

const WorkspaceForm: React.FunctionComponent<WorkspaceFormProps> = ({
  orgLabel,
  projectLabel,
  workspaceId,
  onCancel,
  onSuccess,
}) => {
  const [workspace, setWorkspace] = React.useState<Resource>();
  const [dashboards, setDashBoards] = React.useState<Resource[]>([]);
  const [targetKeys, setTargetKeys] = React.useState<string[]>([]);
  const [views, setViews] = React.useState<Resource[]>([]);
  const [viewToAdd, setViewToAdd] = React.useState<string>(
    DEFAULT_SPARQL_VIEW_ID
  );
  const [label, setLabel] = React.useState<string>();
  const [description, setDescription] = React.useState<string>();
  const [error, setError] = React.useState<NexusSparqlError | Error>();
  const [namePrompt, setNamePrompt] = React.useState<boolean>(false);
  const nexus = useNexusContext();
  const currentDashboards = React.useMemo(() => {
    if (workspace) {
      return workspace['dashboards'] as any[];
    }
    return [];
  }, [workspace]);

  const saveDashBoards = (workspace: Resource) => {
    const newList: dashboard[] = [
      ...dashboards
        .filter((value, index) => targetKeys.includes(index.toString()))
        .map(d => {
          return { dashboard: d['@id'], view: viewToAdd };
        }),
    ];
    const newWorkspace = {
      ...workspace,
      label,
      description,
      dashboards: newList,
    };
    setWorkspace(newWorkspace);
    nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(workspace['@id']),
      workspace['_rev'],
      newWorkspace
    )
      .then(result => {
        if (onSuccess) {
          message.success(
            <span>
              Workspace <em>{workspace.label}</em> updated
            </span>
          );
          onSuccess();
        }
        onCancel();
      })
      .catch(error => {
        message.error(
          <span>
            Workspace <em>{workspace.label}</em> could not be updated
          </span>
        );
        setError(error);
      });
  };

  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(workspaceId))
      .then(workspace => {
        const workspaceResource = workspace as Resource<{
          dashboards: { dashboard: string; view: string }[];
          label: string;
          description: string;
        }>;
        setWorkspace(workspaceResource);
        setLabel(workspaceResource['label']);
        // Set the first view as the default value
        // inside the SelectView input
        if (
          workspaceResource.dashboards &&
          workspaceResource['dashboards'].length
        ) {
          setViewToAdd(workspaceResource['dashboards'][0].view);
        }
        setDescription(workspaceResource['description']);
      })
      .catch(error => setError(error));
  }, []);

  React.useEffect(() => {
    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
      {
        query: {
          bool: {
            must: [
              {
                term: { _deprecated: false },
              },
              {
                term: { '@type': DASHBOARD_TYPE },
              },
            ],
          },
        },
        size: RESULTS_SIZE,
      }
    )
      .then((results: ElasticSearchViewQueryResponse<any>) => {
        if (results.hits.hits) {
          try {
            const tempDashbaord = results.hits.hits.map(hit => {
              return {
                ...JSON.parse(hit._source['_original_source']),
                '@id': hit._source['@id'],
              };
            });
            setDashBoards(tempDashbaord);
          } catch (e) {
            setDashBoards([]);
          }
        }
      })
      .catch(e => {
        setDashBoards([]);
        setError(e);
      });
  }, []);

  React.useEffect(() => {
    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
      {
        query: {
          bool: {
            must: [
              {
                term: { _deprecated: false },
              },
              {
                term: { '@type': VIEW_TYPE },
              },
              {
                bool: {
                  should: [
                    {
                      term: { '@type': SPARQL_VIEW_TYPE },
                    },
                    {
                      term: { '@type': ES_VIEW_TYPE },
                    },
                    {
                      term: { '@type': AGGREGATE_VIEW_TYPE },
                    },
                  ],
                },
              },
            ],
          },
        },
        size: RESULTS_SIZE,
      }
    )
      .then((results: ElasticSearchViewQueryResponse<any>) => {
        setViews(
          results.hits.hits.map(hit => {
            return {
              ...JSON.parse(hit._source['_original_source']),
              '@id': hit._source['@id'],
            };
          })
        );
      })
      .catch(e => {
        setViews([]);
        setError(e);
      });
  });

  React.useEffect(() => {
    if (workspace && dashboards.length > 0) {
      const currentDashboards = workspace['dashboards']
        ? (workspace['dashboards'] as dashboard[])
        : [];
      const indices: string[] = currentDashboards.map(c => {
        const index = dashboards.findIndex(w => w['@id'] === c.dashboard);
        return index.toString();
      });
      setTargetKeys(indices);
    }
  }, [workspace, dashboards]);

  const getTransferData = () => {
    const items: {
      key: string;
      title: string;
      description?: string;
      disabled?: boolean;
      [name: string]: any;
    }[] = [];
    dashboards.map((value, index) => {
      const item = {
        key: index.toString(),
        title: value['label'] as string,
        description: value['description'] as string,
      };
      items.push(item);
    });
    return items;
  };

  const handleChange = (
    targetKeys: string[],
    direction: string,
    moveKeys: string[]
  ) => {
    setTargetKeys(targetKeys);
  };

  if (error) {
    return (
      <Alert
        message="Error loading dashboard"
        description={`Something went wrong. ${(error as NexusSparqlError)
          .reason || (error as Error).message}`}
        type="error"
      />
    );
  }

  const [hasOldDashboard, setHasOldDashboard] = React.useState<boolean>(false);
  React.useEffect(() => {
    Promise.all(
      currentDashboards.map(d =>
        nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(d.dashboard)
        )
      )
    ).then(results => {
      const hasOldDashboard = !!results.find(d => !('dataTable' in d));
      setHasOldDashboard(hasOldDashboard);
    });
  }, [currentDashboards]);

  return (
    <>
      {workspace ? (
        <Modal
          title={`Edit ${workspace['label']}`}
          visible={true}
          footer={null}
          onCancel={() => onCancel()}
          width={700}
        >
          <Form layout="vertical">
            {hasOldDashboard && currentDashboards.length > 0 && viewToAdd && (
              <Form.Item label={'Select View for the Dashboards(s)'}>
                <SelectViews
                  views={views}
                  setView={(view: string) => setViewToAdd(view)}
                  selectedView={viewToAdd}
                />
              </Form.Item>
            )}
            <Form.Item label={'Add or Remove Dashboards'}>
              <Transfer
                targetKeys={targetKeys}
                dataSource={getTransferData()}
                render={item => <span>{item.title}</span>}
                onChange={handleChange}
              />
            </Form.Item>
            <Form.Item
              label={'Label'}
              required
              extra={namePrompt ? 'Name cannot be empty' : ''}
            >
              <Input
                value={label}
                onChange={e => {
                  if (e.target.value.trim().length > 0) {
                    setLabel(e.target.value);
                    setNamePrompt(false);
                  } else {
                    setNamePrompt(true);
                  }
                }}
              />
            </Form.Item>
            <Form.Item label={'Description'}>
              <TextArea
                value={description}
                onChange={e => {
                  e.preventDefault();
                  setDescription(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                disabled={namePrompt}
                onClick={e => {
                  saveDashBoards(workspace);
                }}
              >
                Save
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      ) : null}
    </>
  );
};

export default WorkspaceForm;
