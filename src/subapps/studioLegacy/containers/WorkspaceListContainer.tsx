import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Modal, Menu } from 'antd';
import useNotification from '../../../shared/hooks/useNotification';
import TabList from '../../../shared/components/Tabs/TabList';
import AddWorkspaceContainer from './AddWorkspaceContainer';
import './WorkspaceList.less';
import WorkspaceForm from './WorkspaceFormContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import { StudioContext } from '../views/StudioView';
import DashboardList from '../containers/DashboardListContainer';
import { resourcesWritePermissionsWrapper } from '../../../shared/utils/permission';
import { ResultTableFields } from '../../../shared/types/search';
import {
  MailOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;

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

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

type WorkspaceListProps = {
  workspaceIds: string[];
  studioResource: StudioResource;
  onListUpdate(): void;
};
export type Dashboard = {
  dashboard: string;
  label?: string;
  view: string;
  fields?: ResultTableFields[];
};

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workspaceIds = [],
  studioResource,
  onListUpdate,
}) => {
  const notification = useNotification();
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<boolean>(
    false
  );
  const [deleteWokspaceId, setDeleteWorkspaceId] = React.useState<string>();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [queryParams, setQueryString] = useQueryString();
  const studioContext = React.useContext(StudioContext);
  const {
    orgLabel,
    projectLabel,
    workspaceId,
    isWritable,
    dashboardId,
  } = studioContext;
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [workspaces, setWorkspaces] = React.useState<Resource<any>[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<
    Resource<any>
  >();
  const [showEdit, setShowEdit] = React.useState<boolean>(false);
  const [workspaceToEdit, setWorkSpaceToEdit] = React.useState<string>();
  const [currentDashboard, setCurrentDashboard] = React.useState<string>('');
  const [
    workspaceDashboardResources,
    setWorkspaceDashboardResources,
  ] = React.useState<Resource[]>([]);

  const nexus = useNexusContext();
  const dashboards =
    selectedWorkspace && selectedWorkspace['dashboards']
      ? selectedWorkspace['dashboards']
      : [];

  const fetchAndSetupDashboards = (dashboards: Dashboard[]) => {
    Promise.all(
      dashboards.map(dashboardObject => {
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
        const sortedValues = values.sort(({ label: a }, { label: b }) => {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        setWorkspaceDashboardResources(sortedValues);
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  };

  React.useEffect(() => {
    Promise.all(
      workspaceIds.map(workspaceId => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(workspaceId)
        ) as Promise<Resource>;
      })
    )
      .then(values => {
        values.map(function(workspace) {
          Promise.all(
            workspace.dashboards.map((dashboardObject: Dashboard) => {
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
          ).then(dashValues => {
						console.log("dashValues");
						console.log(dashValues);
						workspace.dashboards = dashValues;
					});
        });
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
          setQueryString({
            ...queryParams,
            workspaceId: values[0]['@id'],
            // Make sure to deselect dashboards
            // Some workspaces may share a dashboard with the same @id
            // remove keys using undefined
            // https://www.npmjs.com/package/query-string#falsy-values
            dashboardId: undefined,
          });
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [workspaceIds]);

  React.useEffect(() => {
    if (dashboards.length > 0) {
      fetchAndSetupDashboards(dashboards);
    }
  }, [dashboards]);

  const tabAction = (
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
  );

  const editButtonWrapper = (id: string) => {
    const editButton = (
      <Button
        key={id}
        className="studio-edit-button"
        type="link"
        size="small"
        onClick={e => {
          setWorkSpaceToEdit(id);
          setShowEdit(true);
          e.stopPropagation();
        }}
      >
        Edit
      </Button>
    );
    return resourcesWritePermissionsWrapper(editButton, permissionsPath);
  };

  const editWorkspace = React.useCallback(
    async (
      e: React.MouseEvent | React.KeyboardEvent | string,
      action: 'add' | 'remove'
    ) => {
      if (action === 'add') {
        setShowModal(true);
      } else {
        setDeleteWorkspaceId(e.toString());
        setDeleteConfirmation(true);
      }
    },
    [orgLabel, projectLabel, studioResource, nexus]
  );

  const deleteWorkSpaceCallBack = React.useCallback(async () => {
    if (!deleteWokspaceId) {
      return;
    }
    try {
      setDeleteConfirmation(false);
      setDeleteWorkspaceId(undefined);
      await removeWorkSpace(
        nexus,
        deleteWokspaceId,
        studioResource,
        projectLabel,
        orgLabel,
        studioResource['@id']
      );
      onListUpdate();
      notification.success({
        message: 'Removed workspace succesfully!',
      });
    } catch (ex) {
      notification.error({
        message: 'Failed to remove workspace!',
      });
    }
  }, [
    deleteConfirmation,
    deleteWokspaceId,
    orgLabel,
    projectLabel,
    studioResource,
    nexus,
  ]);

  const handleClick = (e: any) => {
    console.log('click ', e);
    setCurrentDashboard(e.key);
  };

  return (
    <div className="workspace-list-container">
      <Menu
        onClick={handleClick}
        selectedKeys={[currentDashboard]}
        mode="horizontal"
      >
        {workspaces.map(function(workspace, index) {
          return (
            <SubMenu
              key={index}
              icon={<SettingOutlined />}
              title={workspace.label}
            >
              {workspace.dashboards.map(function(d: any, i: any) {
                return <Menu.Item key={d["@id"]}>{d.label}</Menu.Item>;
              })}
            </SubMenu>
          );
        })}
      </Menu>
      <div className="dashboard-container">
        {selectedWorkspace ? (
          <div className="workspace">
            <DashboardList
              key={workspaceId}
              dashboards={dashboards}
              dashboard={currentDashboard}
              refreshList={onListUpdate}
            />{' '}
          </div>
        ) : null}
      </div>
      <Modal
        title="Delete Workspace"
        visible={deleteConfirmation}
        onCancel={() => {
          setDeleteConfirmation(false);
          setDeleteWorkspaceId(undefined);
        }}
        onOk={deleteWorkSpaceCallBack}
      >
        <p>Are you sure you want to delete ?</p>
      </Modal>
      {showEdit && !!workspaceToEdit ? (
        <WorkspaceForm
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          workspaceId={workspaceToEdit}
          onCancel={() => setShowEdit(false)}
          onSuccess={onListUpdate}
        />
      ) : null}
    </div>
  );
};

export default WorkspaceList;
