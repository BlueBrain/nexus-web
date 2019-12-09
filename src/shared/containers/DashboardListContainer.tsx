import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import AddDashboard from '../components/Studio/AddDashboard';
import EditDashboardModal from '../components/Studio/EditDashboardModal';

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
  const [editModal, setEditModal] = React.useState<React.ReactElement | null>(
    null
  );
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
      setEditModal(
        <EditDashboardModal
          id={id}
          label={dashboard.label}
          description={dashboard.description}
        ></EditDashboardModal>
      );
    }
  };

  return (
    <div>
      <>
        {editModal}
        <TabList
          items={dashboardResources.map(w => ({
            label: w.label,
            description: w.description,
            id: w['@id'],
          }))}
          onSelected={(id: string) => {
            selectDashboard(id);
          }}
          position="left"
          defaultActiveId={
            dashboardResources.length
              ? dashboardId
                ? decodeURIComponent(dashboardId)
                : dashboardResources[0]['@id']
              : undefined
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
              dashboardId={dashboardId ? dashboardId : selectedDashboard['@id']}
              studioResourceId={studioResourceId}
              dataQuery={selectedDashboard['dataQuery']}
            />
          ) : null}
        </TabList>
      </>
    </div>
  );
};

export default DashboardList;
