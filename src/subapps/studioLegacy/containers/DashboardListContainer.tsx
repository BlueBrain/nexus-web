import * as React from 'react';
import { Resource, DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../../../shared/components/Tabs/TabList';
import { Button } from 'antd';
import { StudioContext } from '../views/StudioView';
import DashboardResultsContainer from './DashboardResultsContainer';
import DashboardEditorContainer from './DashBoardEditor/DashboardEditorContainer';
import CreateDashboardContainer from './DashBoardEditor/CreateDashboardContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import { resourcesWritePermissionsWrapper } from '../../../shared/utils/permission';

export type Dashboard = {
  dashboard: string;
  view: string;
};

interface DashboardListProps {
  dashboards: Dashboard[];
  refreshList?(): void;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards,
  refreshList,
}) => {
  const studioContext = React.useContext(StudioContext);
  const { orgLabel, projectLabel, workspaceId, dashboardId } = studioContext;
  const [queryParams, setQueryString] = useQueryString();
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboardIndex, setSelectedDashboardIndex] = React.useState<
    number
  >(0);
  const [
    selectedDashboardResourcesIndex,
    setSelectedDashboardResourcesIndex,
  ] = React.useState<number>(0);
  const [
    editingDashboard,
    setEditingDashboard,
  ] = React.useState<Resource | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const nexus = useNexusContext();

  const selectDashboard = (dashboardResourcesIndex: number) => {
    const dashboard = dashboardResources[dashboardResourcesIndex];
    const dashboardId = dashboard['@id'];
    const dashboardsIndex = dashboards.findIndex(
      d => d.dashboard === dashboardId
    );
    setSelectedDashboardResourcesIndex(dashboardResourcesIndex);
    setSelectedDashboardIndex(dashboardsIndex);
    setQueryString({
      ...queryParams,
      dashboardId,
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
        const sortedValues = values.sort(({ label: a }, { label: b }) => {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        setDashboardResources(sortedValues);
        if (
          dashboardId &&
          sortedValues[selectedDashboardIndex]['@id'] !== dashboardId
        ) {
          const selectedDashboardIndex = dashboards.findIndex(
            d => d.dashboard === dashboardId
          );
          const selectedDashboardResourcesIndex = sortedValues.findIndex(
            d => d['@id'] === dashboardId
          );
          setSelectedDashboardIndex(selectedDashboardIndex);
          setSelectedDashboardResourcesIndex(selectedDashboardResourcesIndex);
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  };

  React.useEffect(() => {
    fetchAndSetupDashboards();
  }, [dashboards]);

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

  const tabAction = (
    <CreateDashboardContainer
      orgLabel={orgLabel}
      projectLabel={projectLabel}
      workspaceId={workspaceId as string}
      onSuccess={refreshList}
    />
  );

  const editButtonWrapper = (id: string) => {
    const editButton = (
      <Button
        className="studio-edit-button"
        type="link"
        size="small"
        onClick={e => {
          handleElementClick(id);
          e.stopPropagation();
        }}
      >
        Edit
      </Button>
    );
    return resourcesWritePermissionsWrapper(editButton, permissionsPath);
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
        activeKey={`${selectedDashboardResourcesIndex}`}
        tabAction={resourcesWritePermissionsWrapper(tabAction, permissionsPath)}
        editButton={editButtonWrapper}
      >
        {!!dashboardResources.length &&
          !!dashboardResources[selectedDashboardResourcesIndex] && (
            <DashboardResultsContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              viewId={
                (dashboards[selectedDashboardIndex] &&
                  dashboards[selectedDashboardIndex].view) ||
                DEFAULT_SPARQL_VIEW_ID
              }
              dataQuery={
                dashboardResources[selectedDashboardResourcesIndex].dataQuery
              }
            />
          )}
      </TabList>
    </div>
  );
};

export default DashboardList;
