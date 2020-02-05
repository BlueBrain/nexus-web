import * as React from 'react';
import { Resource, DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';
import DashboardEditorContainer from './DashboardEditor/DashboardEditorContainer';
import CreateDashboardContainer from './DashboardEditor/CreateDashboardContainer';
import useQueryString from '../hooks/useQueryString';

export type Dashboard = {
  dashboard: string;
  view: string;
};

interface DashboardListProps {
  dashboards: Dashboard[];
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  refreshList?(): void;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards,
  orgLabel,
  projectLabel,
  workspaceId,
  refreshList,
}) => {
  const [queryParams, setQueryString] = useQueryString();
  const { dashboardId } = queryParams;
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
    setQueryString({
      ...queryParams,
      dashboardId: id,
    });
  };

  const fetchAndSetupDashboards = () => {
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
        setDashboardResources(
          values.sort(({ label: a }, { label: b }) => {
            if (a < b) {
              return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;
          })
        );
        if (
          dashboardId &&
          values[selectedDashboardIndex]['@id'] !== dashboardId
        ) {
          const selectedDashboardIndex = dashboards.findIndex(
            d => d.dashboard === dashboardId
          );
          setSelectedDashboardIndex(selectedDashboardIndex);
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  };

  React.useEffect(() => {
    fetchAndSetupDashboards();
  }, [orgLabel, projectLabel, dashboardId, JSON.stringify(dashboards)]);

  const handleElementClick = (stringifiedIndex: string) => {
    const dashboard = dashboardResources[Number(stringifiedIndex)];
    if (dashboard) {
      setEditingDashboard(dashboard);
      setShowEditModal(true);
    }
  };

  const updateDashboards = () => {
    fetchAndSetupDashboards();
    setEditingDashboard(null);
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
            plugins: editingDashboard.plugins,
          }}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          onSuccess={updateDashboards}
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
            onSuccess={refreshList}
          />
        }
        onEditClick={handleElementClick}
      >
        {!!dashboardResources.length &&
          !!dashboardResources[selectedDashboardIndex] && (
            <DashboardResultsContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              viewId={
                (dashboards[selectedDashboardIndex] &&
                  dashboards[selectedDashboardIndex].view) ||
                DEFAULT_SPARQL_VIEW_ID
              }
              dataQuery={dashboardResources[selectedDashboardIndex].dataQuery}
              dashboardUrl={dashboardResources[selectedDashboardIndex]['_self']}
            />
          )}
      </TabList>
    </div>
  );
};

export default DashboardList;
