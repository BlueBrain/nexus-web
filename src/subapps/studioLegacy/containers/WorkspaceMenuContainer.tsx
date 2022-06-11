import * as React from 'react';
import { NexusClient, DEFAULT_SPARQL_VIEW_ID, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Modal, Menu, Popover, Empty, Spin } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownOutlined,
} from '@ant-design/icons';
import useNotification from '../../../shared/hooks/useNotification';
import EditTableForm from '../../../shared/components/EditTableForm';
import DashboardEditorContainer from './DashBoardEditor/DashboardEditorContainer';
import AddWorkspaceContainer from './AddWorkspaceContainer';
import WorkspaceForm from './WorkspaceFormContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import StudioReactContext from './../contexts/StudioContext';
import { resourcesWritePermissionsWrapper } from '../../../shared/utils/permission';
import { ResultTableFields } from '../../../shared/types/search';
import DashboardResultsContainer from './DashboardResultsContainer';
import DataTableContainer, {
  TableResource,
  UnsavedTableResource,
} from '../../../shared/containers/DataTableContainer';
import STUDIO_CONTEXT from '../components/StudioContext';
import { createTableContext } from '../../../subapps/projects/utils/workFlowMetadataUtils';
import { find } from 'lodash';

const DASHBOARD_TYPE = 'StudioDashboard';

/**
 *
 * @param selectedWorkspace
 * @param dashboards
 * @param setSelectedDashboard
 */
function reSelectDashboard(
  selectedWorkspace: any,
  dashboards: any[],
  setSelectedDashboard: React.Dispatch<any>
) {
  if (selectedWorkspace['dashboards'].length > 0) {
    const newSelectedDashboard = dashboards.find(
      d => d['@id'] === selectedWorkspace['dashboards'][0]['dashboard']
    );
    if (newSelectedDashboard) {
      setSelectedDashboard(newSelectedDashboard);
    } else {
      setSelectedDashboard(undefined);
    }
  }
}

/**
 *
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 * @param workspaceId
 * @param dashboardIndex
 * @param dashboards
 */
const removeDashBoard = async (
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  workspaceId: string,
  dashboardIndex: number,
  dashboards: Dashboard[]
) => {
  const workspace = (await nexus.Resource.get<Resource>(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspaceId)
  )) as Resource;

  dashboards.splice(dashboardIndex, 1);

  const workspaceSource = await nexus.Resource.getSource<{
    [key: string]: any;
  }>(orgLabel, projectLabel, encodeURIComponent(workspaceId));
  if (workspace) {
    await nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(workspaceId),
      workspace._rev,
      {
        ...workspaceSource,
        dashboards,
      }
    );
  }
};

/**
 *
 * @param nexus
 * @param workspaceId
 * @param studio
 * @param projectLabel
 * @param orgLabel
 * @param studioResourceId
 */
const removeWorkSpace = async (
  nexus: NexusClient,
  workspaceId: string,
  studio: StudioResource,
  projectLabel: string,
  orgLabel: string,
  studioResourceId: string
) => {
  const workspaces = studio.workspaces;
  if (workspaces) {
    const index = workspaces.indexOf(workspaceId);
    if (index !== -1) {
      workspaces.splice(index, 1);
    }
  }
  const studioSource = await nexus.Resource.getSource<StudioResource>(
    orgLabel,
    projectLabel,
    encodeURIComponent(studio['@id'])
  );
  const studioUpdatePayload = {
    ...studioSource,
    workspaces,
  };

  await nexus.Resource.update(
    orgLabel,
    projectLabel,
    encodeURIComponent(studioResourceId),
    studio._rev,
    studioUpdatePayload
  );

  const latestWorkspace = (await nexus.Resource.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspaceId)
  )) as Resource;
  await nexus.Resource.deprecate(
    orgLabel,
    projectLabel,
    encodeURIComponent(workspaceId),
    Number(latestWorkspace._rev)
  );
};

export type Dashboard = {
  dashboard: string;
  view: string;
  fields?: ResultTableFields[];
};

export type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

type WorkspaceMenuProps = {
  workspaceIds: string[];
  studioResource: StudioResource;
  onListUpdate(): void;
};

const WorkspaceMenu: React.FC<WorkspaceMenuProps> = ({
  workspaceIds = [],
  studioResource,
  onListUpdate,
}) => {
  const nexus = useNexusContext();
  const notification = useNotification();
  const studioContext = React.useContext(StudioReactContext);
  const { orgLabel, projectLabel, workspaceId, dashboardId } = studioContext;
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [workspaces, setWorkspaces] = React.useState<Resource<any>[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<
    Resource<any>
  >();
  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Resource<any>
  >();
  const [dashboards, setDashboards] = React.useState<Resource<any>[]>([]);
  const [dashboardSpinner, setDashboardSpinner] = React.useState<boolean>(
    false
  );
  const [selectedKeys, setSelectedKeys] = React.useState<Resource<any>[]>([]);
  const [queryParams, setQueryString] = useQueryString();
  const [showDataTableEdit, setShowDataTableEdit] = React.useState(false);
  const [showDashEditor, setShowDashEditor] = React.useState(false);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<boolean>(
    false
  );
  const [
    deleteDashBoardConfirmation,
    setDeleteDashBoardConfirmation,
  ] = React.useState<boolean>(false);
  const [showEdit, setShowEdit] = React.useState<boolean>(false);

  const [showEditTableForm, setShowEditTableForm] = React.useState<boolean>(
    false
  );
  const [isBusy, setIsBusy] = React.useState(false);

  const saveDashboardAndDataTable = async (
    table: TableResource | UnsavedTableResource
  ) => {
    setIsBusy(true);
    try {
      if (!selectedWorkspace) throw new Error();
      const workspaceId = selectedWorkspace['@id'];
      try {
        await createTableContext(orgLabel, projectLabel, nexus);
      } catch (ex) {
        // assume already exists
      }
      // create table

      const resource = (await nexus.Resource.create(
        orgLabel,
        projectLabel,
        table
      )) as TableResource;
      const tableId = resource['@id'];

      // create dashboard, linking it to the table
      const dashboard = await nexus.Resource.create(orgLabel, projectLabel, {
        '@context': STUDIO_CONTEXT['@id'],
        '@type': DASHBOARD_TYPE,
        dataTable: {
          '@id': tableId,
        },
        label: table.name,
        dataQuery: '',
      });
      // Add dashboard to workspace
      const workspace = (await nexus.Resource.get<Resource>(
        orgLabel,
        projectLabel,
        encodeURIComponent(workspaceId)
      )) as Resource;
      const workspaceSource = await nexus.Resource.getSource<{
        [key: string]: any;
      }>(orgLabel, projectLabel, encodeURIComponent(workspaceId));
      if (workspace) {
        await nexus.Resource.update(
          orgLabel,
          projectLabel,
          encodeURIComponent(workspaceId),
          workspace._rev,
          {
            ...workspaceSource,
            dashboards: [
              ...workspaceSource.dashboards,
              {
                dashboard: dashboard['@id'],
              },
            ],
          }
        );
      }

      setShowEditTableForm(false);
      onListUpdate();
    } catch (e) {
      notification.error({ message: 'Failed to save dashboard' });
    }
    setIsBusy(false);
  };

  const deleteWorkSpaceCallBack = React.useCallback(async () => {
    if (!selectedWorkspace) {
      return;
    }
    try {
      setDeleteConfirmation(false);
      await removeWorkSpace(
        nexus,
        selectedWorkspace['@id'],
        studioResource,
        projectLabel,
        orgLabel,
        studioResource['@id']
      );
      onListUpdate();
      setSelectedWorkspace(undefined);
      notification.success({
        message: 'Removed workspace succesfully!',
      });
    } catch (ex) {
      notification.error({
        message: 'Failed to remove workspace!',
      });
    }
  }, [selectedWorkspace]);

  const editDhashBoardspaceWrapper = () => {
    const editButton = (
      <>
        <Button
          block
          type="default"
          icon={<PlusOutlined />}
          onClick={e => {
            setShowEditTableForm(true);
          }}
        >
          Add
        </Button>
        {selectedDashboard ? (
          <>
            <Button
              block
              type="default"
              icon={<DeleteOutlined />}
              onClick={e => {
                setDeleteDashBoardConfirmation(true);
              }}
            >
              Remove
            </Button>

            <Button
              block
              type="default"
              icon={<EditOutlined />}
              onClick={e => {
                if (selectedDashboard && 'dataTable' in selectedDashboard) {
                  setShowDataTableEdit(true);
                } else {
                  setShowDashEditor(true);
                }
              }}
            >
              Edit
            </Button>
          </>
        ) : null}
      </>
    );

    return resourcesWritePermissionsWrapper(editButton, permissionsPath);
  };

  const editWorkspaceWrapper = () => {
    const editButton = (
      <>
        <Button
          block
          type="default"
          icon={<PlusOutlined />}
          onClick={e => {
            setShowModal(true);
          }}
        >
          Add
        </Button>
        {selectedWorkspace ? (
          <>
            <Button
              block
              type="default"
              icon={<DeleteOutlined />}
              onClick={e => {
                setDeleteConfirmation(true);
              }}
            >
              Remove
            </Button>

            <Button
              block
              type="default"
              icon={<EditOutlined />}
              onClick={e => {
                setShowEdit(true);
              }}
            >
              Edit
            </Button>
          </>
        ) : null}
      </>
    );

    return resourcesWritePermissionsWrapper(editButton, permissionsPath);
  };

  const actionButtons = () => {
    const actionsPopovers = (
      <>
        <Popover
          style={{ background: 'none' }}
          placement="rightTop"
          content={editWorkspaceWrapper}
          trigger="click"
        >
          <Button
            shape="round"
            type="default"
            icon={<EditOutlined />}
            style={{
              marginRight: '5px',
            }}
            role="button"
          >
            {' '}
            Workspace
          </Button>
        </Popover>
        {selectedWorkspace ? (
          <Popover
            style={{ background: 'none' }}
            placement="rightTop"
            content={editDhashBoardspaceWrapper}
            trigger="click"
          >
            <Button
              shape="round"
              type="default"
              icon={<EditOutlined />}
              role="button"
            >
              Dashboard
            </Button>
          </Popover>
        ) : null}
      </>
    );
    return resourcesWritePermissionsWrapper(actionsPopovers, permissionsPath);
  };

  const fetchAndSetupDashboards = async () => {
    setDashboardSpinner(true);
    Promise.all(
      selectedWorkspace['dashboards'].map((dashboardObject: Dashboard) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(dashboardObject.dashboard)
        ) as Promise<
          Resource<{
            label: string;
            description?: string;
            dataQuery: string;
            plugins: string[];
          }>
        >;
      })
    )
      .then(values => {
        setDashboards(values);
        const currentDashboards = values as Resource<{
          label: string;
          description?: string;
          dataQuery: string;
          plugins: string[];
        }>[];
        if (currentDashboards.length > 0) {
          if (dashboardId) {
            const currentSelection = currentDashboards.find(
              v => v['@id'] === dashboardId
            );
            if (currentSelection) {
              setSelectedDashboard(currentSelection);
            }
          } else {
            if (!selectedDashboard) {
              setSelectedDashboard(currentDashboards[0]);
            }
          }
        }
      })
      .catch(e => {
        notification.error({
          message: 'Failed to fetch dashboards',
        });
      });
    setDashboardSpinner(false);
  };

  const updateDashboard = async (
    data: TableResource | UnsavedTableResource
  ) => {
    if (selectedDashboard) {
      const resource = await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(selectedDashboard['@id'])
      );
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(selectedDashboard['@id']),
        selectedDashboard._rev,
        {
          ...resource,
          description: data.description,
          label: data['name'],
        }
      );
      onListUpdate();
    }
  };

  const removeDashBoardCallback = React.useCallback(async () => {
    if (selectedDashboard && selectedWorkspace) {
      const currentDashboards: any[] = selectedWorkspace['dashboards'];
      if (dashboards) {
        const indexToRemove = currentDashboards.findIndex(
          d => d['dashboard'] === selectedDashboard['@id']
        );
        if (indexToRemove >= 0) {
          await removeDashBoard(
            nexus,
            orgLabel,
            projectLabel,
            selectedWorkspace['@id'],
            indexToRemove,
            [...currentDashboards]
          );
          notification.success({
            message: `Removed ${selectedDashboard.label}`,
          });
        } else {
          notification.error({
            message: `Failed to remove ${selectedDashboard.label}`,
          });
        }
        setDeleteDashBoardConfirmation(false);
        onListUpdate();
        reSelectDashboard(selectedWorkspace, dashboards, setSelectedDashboard);
      }
    }
  }, [selectedWorkspace, selectedDashboard]);

  React.useEffect(() => {
    if (workspaceIds.length > 0) {
      Promise.all(
        workspaceIds
          .filter(w => w !== undefined && w !== null)
          .map(workspaceId => {
            return nexus.Resource.get(
              orgLabel,
              projectLabel,
              encodeURIComponent(workspaceId)
            ) as Promise<Resource>;
          })
      )
        .then(values => {
          setWorkspaces(
            values.sort(({ _createdAt: dateA }, { _createdAt: dateB }) => {
              const a = new Date(dateA);
              const b = new Date(dateB);
              if (a > b) {
                return 1;
              }
              if (a < b) {
                return -1;
              }
              return 0;
            })
          );
          if (workspaceId) {
            const workspaceFilteredById = values.find(
              w => w['@id'] === workspaceId
            );
            setSelectedWorkspace(
              workspaceFilteredById ? workspaceFilteredById : values[0]
            );
          } else {
            setSelectedWorkspace(values[0]);
          }
        })
        .catch(e => {
          notification.error({
            message: 'Failed to fetch workpaces',
          });
        });
    }
  }, [workspaceIds]);

  React.useEffect(() => {
    if (selectedDashboard) {
      const dashboardId = selectedDashboard['@id'];
      setQueryString({
        ...queryParams,
        dashboardId,
        workspaceId: selectedWorkspace['@id'],
      });
    }
  }, [selectedDashboard]);

  React.useEffect(() => {
    if (selectedWorkspace) {
      setQueryString({
        ...queryParams,
        workspaceId: selectedWorkspace['@id'],
      });

      const currentDashboards = selectedWorkspace['dashboards'] as Dashboard[];
      if (currentDashboards && currentDashboards.length > 0) {
        fetchAndSetupDashboards();
      } else {
        setDashboards([]);
        setSelectedDashboard(undefined);
      }
      // block to set selected keys for initial load or when not set
      try {
        if (selectedKeys.length === 0) {
          if (!selectedDashboard) {
            if (selectedWorkspace.dashboards?.length > 0) {
              setSelectedKeys([
                `${selectedWorkspace['@id']}*${selectedWorkspace.dashboards[0].dashboard}`,
              ]);
            }
          } else {
            setSelectedKeys([
              `${selectedWorkspace['@id']}*${selectedDashboard['@id']}`,
            ]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedWorkspace]);

  const renderResults = React.useCallback(() => {
    return selectedDashboard ? (
      'dataTable' in selectedDashboard ? (
        // New format Studio
        <DataTableContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          tableResourceId={selectedDashboard['dataTable']['@id']}
          onSave={updateDashboard}
          key={`data-table-${selectedDashboard['dataTable']['@id']}}`}
          options={{
            disableDelete: true,
            disableAddFromCart: true,
            disableEdit: true,
          }}
          showEdit={showDataTableEdit}
          toggledEdit={show => setShowDataTableEdit(show)}
        />
      ) : (
        // Old format Studio
        <DashboardResultsContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          dashboardLabel={selectedDashboard.label}
          key={selectedDashboard['@id']}
          viewId={
            selectedWorkspace?.dashboards[0]?.view || DEFAULT_SPARQL_VIEW_ID
          }
          fields={selectedDashboard.fields}
          dataQuery={selectedDashboard.dataQuery}
        />
      )
    ) : (
      <Empty description={`No dashboards available`} />
    );
  }, [selectedDashboard, showDataTableEdit]);

  function selectKeysHighlight(w: Resource) {
    if (selectedDashboard) {
      const found = find(w.dashboards, d => {
        return selectedDashboard['@id'] === d.dashboard;
      });
      if (
        selectedKeys.length > 0 &&
        found &&
        selectedKeys[0].split('*')[0] === w['@id']
      ) {
        return 'menu-highlight-override';
      }
    }
    return '';
  }
  return (
    <div className="workspace-list-container">
      <Menu
        theme="dark"
        mode="horizontal"
        selectable={false}
        triggerSubMenuAction="click"
        selectedKeys={selectedKeys}
        style={{
          minHeight: '40px',
        }}
      >
        {workspaces.map(w => (
          <Menu.SubMenu
            icon={<DownOutlined />}
            title={w.label}
            key={w['@id']}
            popupOffset={[0, 0]}
            className={selectKeysHighlight(w)}
            onTitleClick={() => setSelectedWorkspace(w)}
            popupClassName="workspace-popup-classname"
          >
            {dashboardSpinner ? (
              <Menu.Item>
                <Spin />
              </Menu.Item>
            ) : (
              dashboards.map((d: Resource) => {
                return (
                  <Menu.Item
                    key={`${w['@id']}-${d['@id']}`}
                    onClick={() => {
                      setSelectedKeys([`${w['@id']}*${d['@id']}`]);
                      setSelectedDashboard(d);
                    }}
                  >
                    {d.label}
                  </Menu.Item>
                );
              })
            )}
          </Menu.SubMenu>
        ))}
        <div className="workspace-action">{actionButtons()}</div>
      </Menu>
      <div>
        {renderResults()}
        <AddWorkspaceContainer
          key={studioResource['@id']}
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          studio={studioResource}
          showModal={showModal}
          onCancel={() => {
            setShowModal(false);
          }}
          onAddWorkspace={onListUpdate}
        />
        {selectedWorkspace ? (
          <Modal
            title="Delete Workspace"
            visible={deleteConfirmation}
            onCancel={() => {
              setDeleteConfirmation(false);
            }}
            onOk={deleteWorkSpaceCallBack}
          >
            <p>{`Are you sure you want to delete ${selectedWorkspace.label}?`}</p>
          </Modal>
        ) : null}
        {showEdit ? (
          <WorkspaceForm
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            workspaceId={selectedWorkspace['@id']}
            onCancel={() => setShowEdit(false)}
            onSuccess={onListUpdate}
          />
        ) : null}

        <Modal
          title="Remove Dashboard"
          visible={deleteDashBoardConfirmation}
          onCancel={() => {
            setDeleteDashBoardConfirmation(false);
          }}
          onOk={removeDashBoardCallback}
        >
          <p>
            Are you sure you want to remove {`${selectedDashboard?.label}`} ?
          </p>
        </Modal>
        <Modal
          visible={showEditTableForm}
          footer={null}
          onCancel={() => setShowEditTableForm(false)}
          width={950}
          destroyOnClose={true}
        >
          <EditTableForm
            onSave={data => {
              saveDashboardAndDataTable(data);
            }}
            onClose={() => setShowEditTableForm(false)}
            busy={isBusy}
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            formName="Create Dashboard"
          />
        </Modal>
        {selectedDashboard && showDashEditor && (
          // TODO: pass dashboard view
          <DashboardEditorContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            dashboardId={selectedDashboard['@id']}
            dashboardRev={selectedDashboard._rev}
            dashboard={{
              label: selectedDashboard.label,
              description: selectedDashboard.description,
              dataQuery: selectedDashboard.dataQuery,
              plugins: selectedDashboard.plugins,
            }}
            showEditModal={showDashEditor}
            viewId={selectedWorkspace['dashboards'][0].view}
            setShowEditModal={setShowDashEditor}
            onSuccess={fetchAndSetupDashboards}
          ></DashboardEditorContainer>
        )}
      </div>
    </div>
  );
};

export default WorkspaceMenu;
