import * as React from 'react';
import {
  Resource,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Alert, Input, Form, Modal, Select, Button, Transfer } from 'antd';

type NexusSparqlError = {
  reason: string;
};

type dashboard = { dashboard: string; view: string };

const DASHBOARD_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/StudioDashboard';

const SPARQL_VIEW_TYPE =
  'https://bluebrain.github.io/nexus/vocabulary/SparqlView';
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
  defaultView: string;
  setView: (view: string) => void;
}> = ({ views, defaultView, setView }) => {
  const { Option } = Select;
  const getViewName = (id: string) => {
    const values = id.split('/');
    return values[values.length - 1];
  };
  const viewOptions: any[] = views.map(d => d['@id']);
  return (
    <>
      <Select
        onChange={(value: string) => {
          setView(value);
        }}
        defaultValue={defaultView}
      >
        {viewOptions.map((d, index) => {
          return (
            <Option key={index.toString()} value={d}>
              {getViewName(d)}
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
  const [viewToAdd, setViewToAdd] = React.useState<string>('');
  const [label, setLabel] = React.useState<string>();
  const [description, setDescription] = React.useState<string>();
  const [error, setError] = React.useState<NexusSparqlError | Error>();
  const [namePrompt, setNamePrompt] = React.useState<boolean>(false);
  const nexus = useNexusContext();
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
          onSuccess();
        }
        onCancel();
      })
      .catch(error => {
        setError(error);
      });
  };

  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(workspaceId))
      .then(workspace => {
        const workspaceResource = workspace as Resource;
        setWorkspace(workspaceResource);
        setLabel(workspaceResource['label']);
        setDescription(workspaceResource['description']);
      })
      .catch(error => setError(error));

    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      DEFAULT_ELASTIC_SEARCH_VIEW_ID,
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
        const tempDashbaord = results.hits.hits.map(hit => {
          return {
            ...JSON.parse(hit._source['_original_source']),
            '@id': hit._source['@id'],
          };
        });
        setDashBoards(tempDashbaord);
      })
      .catch(e => {
        setError(error);
      });

    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      DEFAULT_ELASTIC_SEARCH_VIEW_ID,
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
        setViewToAdd(results.hits.hits[0]._source['@id']);
      })
      .catch(e => {});
  }, [workspaceId, orgLabel, projectLabel]);

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
  return (
    <>
      {workspace && description ? (
        <Modal
          title={`Edit ${workspace['label']}`}
          visible={true}
          footer={null}
          onCancel={() => onCancel()}
          width={700}
        >
          <Form>
            <Form.Item label={'Select View for the Dashboards(s)'}>
              {viewToAdd ? (
                <SelectViews
                  views={views}
                  setView={(view: string) => setViewToAdd(view)}
                  defaultView={viewToAdd}
                />
              ) : null}
            </Form.Item>
            <Form.Item label={'Add or Remove Dashboards'}>
              <Transfer
                targetKeys={targetKeys}
                dataSource={getTransferData()}
                render={item => item.title}
                onChange={handleChange}
              />
            </Form.Item>
            <Form.Item
              label={'Name'}
              required
              extra={namePrompt ? 'Name cannot be empty' : ''}
            >
              <Input
                defaultValue={label}
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
              <Input
                defaultValue={description}
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
