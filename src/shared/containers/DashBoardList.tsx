import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';

type Dashboard = {
  dashboard: string;
  view: string;
}
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
  const [dashBoards, setDashboards] = React.useState<Resource[]>([]);
  const [selectedDashboard, setSelectedDashboard] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectDashboard = (id: string) => {
    const dashboard = dashBoards.find(d => d['@id'] === id);
    setSelectedDashboard(dashboard);
  };
  useAsyncEffect(async () => {
    const dashboardList: Resource[] = [];
    for (let i = 0; i < dashboards.length; i +=1) {
      const dashboard = await nexus.httpGet({ path : dashboards[i].dashboard }) as Resource;
      dashboardList.push(dashboard);
    }
    setDashboards(dashboardList);
    setSelectedDashboard(dashboardList[0]);
  }, [dashboards]);
  return (
    <>
      {dashBoards.length > 0 ? (
        <TabList
          items={dashBoards.map(w => ({
            label: w.label,
            description: w.description,
            id: w['@id'],
          }))}
          onSelected={(id: string) => {
            selectDashboard(id);
          }}
          position="left"
        >
          {selectedDashboard ? 'Result Table Under Construction' : null}
        </TabList>
      ) : (
        'No Dashboards are available'
      )}
    </>
  );
};

export default DashboardList;
