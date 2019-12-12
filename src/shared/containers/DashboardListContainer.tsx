import * as React from 'react';
import { Resource, DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';
import { useHistory } from 'react-router-dom';
import DashboardEditorContainer from './DashboardEditor/DashboardEditorContainer';
import CreateDashboardContainer from './DashboardEditor/CreateDashboardContainer';

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
  onAddDashboard?(): void;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards = [],
  orgLabel,
  projectLabel,
  workspaceId,
  dashboardId,
  studioResourceId,
  onAddDashboard,
}) => {
  const history = useHistory();
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboardIndex, setSelectedDashboardIndex] = React.useState<
    number
  >(0);
  const [
    editingDashboard,
    setEditingDashboard,
  ] = React.useState<Resource | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const nexus = useNexusContext();

  const selectDashboard = (dashboardIndex: number) => {
    setSelectedDashboardIndex(dashboardIndex);
    const dashboard = dashboardResources[dashboardIndex];
    const id = dashboard['@id'];
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
        if (
          dashboardId &&
          values[selectedDashboardIndex]['@id'] !== dashboardId
        ) {
          const id = decodeURIComponent(dashboardId);
          const selectedDashboardIndex = dashboards.findIndex(
            d => d.dashboard === id
          );
          setSelectedDashboardIndex(selectedDashboardIndex);
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [orgLabel, projectLabel, dashboardId, dashboards]);

  const handleElementClick = (stringifiedIndex: string) => {
    const dashboard = dashboardResources[Number(stringifiedIndex)];
    if (dashboard) {
      setEditingDashboard(dashboard);
      setShowEditModal(true);
    }
  };

  return (
    <div>
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
        items={dashboardResources.map((w, index) => ({
          label: w.label,
          description: w.description,
          id: `${index}`, // must be a string
        }))}
        onSelected={(stringiedIndex: string) => {
          selectDashboard(Number(stringiedIndex));
        }}
        position="left"
        activeKey={`${selectedDashboardIndex}`}
        tabAction={
          <CreateDashboardContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            workspaceId={workspaceId}
            onSuccess={onAddDashboard}
          />
        }
        onEditClick={handleElementClick}
      >
        {!!dashboardResources.length && (
          <DashboardResultsContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            viewId={
              (dashboards[selectedDashboardIndex] &&
                dashboards[selectedDashboardIndex].view) ||
              DEFAULT_SPARQL_VIEW_ID
            }
            workspaceId={workspaceId}
            dashboardId={
              dashboardId
                ? dashboardId
                : dashboardResources[selectedDashboardIndex]['@id']
            }
            studioResourceId={studioResourceId}
            dataQuery={dashboardResources[selectedDashboardIndex].viewQuery}
          />
        )}
      </TabList>
    </div>
  );
};

export default DashboardList;
