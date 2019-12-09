import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardList from './DashboardListContainer';
import { useHistory } from 'react-router-dom';
import AddWorkspaceContainer from './AddWorkspaceContainer';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

type WorkspaceListProps = {
  workspaceIds: string[];
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  dashboardId: string;
  studioResourceId: string;
  studioResource: StudioResource;
};

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workspaceIds = [],
  orgLabel,
  projectLabel,
  workspaceId,
  dashboardId,
  studioResourceId,
  studioResource,
}) => {
  const [workspaces, setWorkspaces] = React.useState<Resource[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Resource>();
  const nexus = useNexusContext();
  const history = useHistory();
  const selectWorkspace = (id: string, values: Resource[]) => {
    const w = values.find(w => w['@id'] === id);
    setSelectedWorkspace(w);
    const path = history.location.pathname.split('/workspaces');
    const newPath = `${path[0]}/workspaces/${encodeURIComponent(id)}`;
    if (!history.location.pathname.includes(newPath)) {
      history.push(newPath);
    }
  };

  React.useEffect(() => {
    Promise.all(
      workspaceIds.map(workspaceId => {
        return nexus.httpGet({
          path: workspaceId,
        });
      })
    )
      .then(values => {
        setWorkspaces(values);
        let w;
        if (
          workspaceId !== undefined &&
          (selectedWorkspace === undefined ||
            selectedWorkspace['@id'] !== decodeURIComponent(workspaceId))
        ) {
          const id = decodeURIComponent(workspaceId);
          w = values.find(w => w['@id'] === id);
        } else {
          w = values[0];
        }
        setSelectedWorkspace(w);
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [workspaceIds, workspaceId]);

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
        defaultActiveId={
          workspaces.length
            ? workspaceId
              ? decodeURIComponent(workspaceId)
              : workspaces[0]['@id']
            : undefined
        }
        position="top"
        tabAction={<AddWorkspaceContainer orgLabel={orgLabel} projectLabel={projectLabel} studio={studioResource} />}
      >
        {selectedWorkspace ? (
          <div className="workspace">
            <DashboardList
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              dashboards={selectedWorkspace['dashboards']}
              workspaceId={
                workspaceId
                  ? workspaceId
                  : encodeURIComponent(selectedWorkspace['@id'])
              }
              dashboardId={dashboardId}
              studioResourceId={studioResourceId}
            />{' '}
          </div>
        ) : null}
      </TabList>
    </>
  );
};

export default WorkspaceList;
