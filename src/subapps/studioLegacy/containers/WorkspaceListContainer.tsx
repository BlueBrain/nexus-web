import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button } from 'antd';
import useNotification from '../../../shared/hooks/useNotification';
import TabList from '../../../shared/components/Tabs/TabList';
import AddWorkspaceContainer from './AddWorkspaceContainer';
import WorkspaceForm from './WorkspaceFormContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import { StudioContext } from '../views/StudioView';
import DashboardList from '../containers/DashboardListContainer';
import { resourcesWritePermissionsWrapper } from '../../../shared/utils/permission';

const removeWorkSpace = async (
  nexus: NexusClient,
  workspaceId: string,
  studio: StudioResource,
  projectLabel: string,
  orgLabel: string,
  studioResourceId: string
) => {
  try {
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
  } catch (ex) {
    console.log(ex);
  }
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

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workspaceIds = [],
  studioResource,
  onListUpdate,
}) => {
  const notification = useNotification();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [queryParams, setQueryString] = useQueryString();
  const studioContext = React.useContext(StudioContext);
  const { orgLabel, projectLabel, workspaceId, isWritable } = studioContext;
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [workspaces, setWorkspaces] = React.useState<Resource<any>[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<
    Resource<any>
  >();
  const [showEdit, setShowEdit] = React.useState<boolean>(false);
  const [workspaceToEdit, setWorkSpaceToEdit] = React.useState<string>();
  const nexus = useNexusContext();
  const dashboards =
    selectedWorkspace && selectedWorkspace['dashboards']
      ? selectedWorkspace['dashboards']
      : [];
  const selectWorkspace = (id: string, values: Resource[]) => {
    const w = values.find(w => w['@id'] === id);
    setSelectedWorkspace(w);
    setQueryString({
      ...queryParams,
      workspaceId: id,
      // Make sure to deselect dashboards
      // Some workspaces may share a dashboard with the same @id
      // remove keys using undefined
      // https://www.npmjs.com/package/query-string#falsy-values
      dashboardId: undefined,
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
        await removeWorkSpace(
          nexus,
          e.toString(),
          studioResource,
          projectLabel,
          orgLabel,
          studioResource['@id']
        );
        onListUpdate();
        notification.success({
          message: 'Removed workspace succesfully!',
        });
      }
    },
    [orgLabel, projectLabel, studioResource, nexus]
  );

  return (
    <>
      <TabList
        items={workspaces.map(w => ({
          label: w.label,
          description: w.description,
          id: w['@id'],
        }))}
        onSelected={(id: string) => {
          selectWorkspace(id, workspaces);
        }}
        tabType={isWritable ? 'editable-card' : 'card'}
        activeKey={
          workspaces.length
            ? (selectedWorkspace && selectedWorkspace['@id']) ||
              workspaces[0]['@id']
            : undefined
        }
        position="top"
        tabAction={resourcesWritePermissionsWrapper(tabAction, permissionsPath)}
        editButton={editButtonWrapper}
        OnEdit={editWorkspace}
      >
        {selectedWorkspace ? (
          <div className="workspace">
            <DashboardList
              key={workspaceId}
              dashboards={dashboards}
              refreshList={onListUpdate}
            />{' '}
          </div>
        ) : null}
      </TabList>
      {showEdit && !!workspaceToEdit ? (
        <WorkspaceForm
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          workspaceId={workspaceToEdit}
          onCancel={() => setShowEdit(false)}
          onSuccess={onListUpdate}
        />
      ) : null}
    </>
  );
};

export default WorkspaceList;
