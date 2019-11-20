import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
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
  useAsyncEffect(async () => {
    const dashboardList: Resource[] = [];
    for (let i = 0; i < dashboards.length; i += 1) {
      try {
        const dashboard = (await nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(dashboards[i].dashboard)
        )) as Resource;
        dashboardList.push(dashboard);
      } catch (error) {
        // TODO: display an error to the user
      }
    }
    setDashboardResources(dashboardList);
    setSelectedDashboard(dashboardList[0]);
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
