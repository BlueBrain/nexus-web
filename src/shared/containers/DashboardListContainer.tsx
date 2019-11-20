import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';

type Dashboard = {
  dashboard: string;
  view: string;
};
interface DashboardListProps {
  dashboards: Dashboard[];
  orgLabel: string;
  projectLabel: string;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards,
  orgLabel,
  projectLabel,
}) => {
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboard, setSelectedDashboard] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectDashboard = (id: string) => {
    const dashboard = dashboardResources.find(d => d['@id'] === id);
    setSelectedDashboard(dashboard);
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
        setSelectedDashboard(values[0]);
      })
      .catch(e => {
        // Fail silently.
      });
  }, [orgLabel, projectLabel]);
  return (
    <>
      {dashboardResources.length > 0 ? (
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
        >
          {selectedDashboard ? (
            <DashboardResultsContainer
              handleClick={(self: string) => {
                /* TODO Logic to display/navigate to resources */
              }}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              viewId={dashboards[0].view}
              dataQuery={selectedDashboard['dataQuery']}
            />
          ) : null}
        </TabList>
      ) : (
        'No Dashboards are available'
      )}
    </>
  );
};

export default DashboardList;
