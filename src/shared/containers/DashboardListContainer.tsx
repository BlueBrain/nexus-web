import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';
import { useHistory } from 'react-router-dom';
import AddDashboard from '../components/Studio/AddDashboard';
import DashboardEditorContainer from './DashboardEditor/DashboardEditorContainer';

type Dashboard = {
  dashboard: string;
  view: string;
};
interface DashboardListProps {
  dashboards: Dashboard[];
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  dashboardId: string;
  studioResourceId: string;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards,
  orgLabel,
  projectLabel,
  workspaceId,
  dashboardId,
  studioResourceId,
}) => {
  const history = useHistory();
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboard, setSelectedDashboard] = React.useState<Resource>();
  const [
    editingDashboard,
    setEditingDashboard,
  ] = React.useState<Resource | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const nexus = useNexusContext();

  const selectDashboard = (id: string) => {
    const dashboard = dashboardResources.find(d => d['@id'] === id);
    setSelectedDashboard(dashboard);
    const path = history.location.pathname.split('/dashboards');
    let newPath;
    if (path[0].includes('/workspaces')) {
      newPath = `${path[0]}/dashboards/${encodeURIComponent(id)}`;
    } else {
      newPath = `${
        path[0]
      }/workspaces/${workspaceId}/dashboards/${encodeURIComponent(id)}`;
    }
    history.push(newPath);
  };

  React.useEffect(() => {
    Promise.all(
      dashboards.map(dashboardObject => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(dashboardObject.dashboard)
        );
      })
    )
      .then(values => {
        setDashboardResources(values);
        let d;
        if (
          dashboardId &&
          (selectedDashboard === undefined ||
            selectedDashboard['@id'] !== dashboardId)
        ) {
          const id = decodeURIComponent(dashboardId);
          d = values.find(d => d['@id'] === id);
        } else {
          d = values[0];
        }
        setSelectedDashboard(d);
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [orgLabel, projectLabel, dashboardId]);

  const handleElementClick = (id: string) => {
    const dashboard = dashboardResources.find(
      dashboard => dashboard['@id'] === id
    );
    if (dashboard) {
      setEditingDashboard(dashboard);
      setShowEditModal(true);
    }
  };

  return (
    <div>
      {dashboardResources.length > 0 ? (
        <>
          {editingDashboard && (
            // TODO: pass dashboard view
            <DashboardEditorContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              dashboardId={editingDashboard['@id']}
              dashboardRev={editingDashboard._rev}
              dashboard={{
                label: editingDashboard.label,
                description: editingDashboard.description,
                dataQuery: editingDashboard.dataQuery,
              }}
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
            ></DashboardEditorContainer>
          )}
          <TabList
            items={dashboardResources.map(w => ({
              label: w.label,
              description: w.description,
              id: w['@id'],
            }))}
            onSelected={(id: string) => {
              // TODO this should select dashboard based on index, not id!
              selectDashboard(id);
            }}
            position="left"
            defaultActiveId={
              dashboardId
                ? decodeURIComponent(dashboardId)
                : dashboardResources[0]['@id']
            }
            tabAction={<AddDashboard />}
            onEditClick={handleElementClick}
          >
            {selectedDashboard ? (
              <DashboardResultsContainer
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                viewId={dashboards[0].view}
                workspaceId={workspaceId}
                dashboardId={
                  dashboardId ? dashboardId : selectedDashboard['@id']
                }
                studioResourceId={studioResourceId}
                dataQuery={selectedDashboard['dataQuery']}
              />
            ) : null}
          </TabList>
        </>
      ) : (
        'No Dashboards are available'
      )}
    </div>
  );
};

export default DashboardList;
