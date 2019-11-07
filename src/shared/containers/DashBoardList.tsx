import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';

interface DashBoard {
  dashboard: string;
  view: string;
}
interface DashBoardListProps {
  dashboards: DashBoard[];
  orgLabel: string;
  projectLabel: string;
}

const DashBoardList: React.FunctionComponent<DashBoardListProps> = ({
  dashboards,
  orgLabel,
  projectLabel,
}) => {
  const [dashBoards, setDashBoards] = React.useState<Resource[]>([]);
  const [selectedDashBoard, setSelectedDashBoard] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectDashBoard = (id: string) => {
    const dashboard = dashBoards.find(d => d['@id'] === id);
    setSelectedDashBoard(dashboard);
  };
  useAsyncEffect(async () => {
    const dashboardList: Resource[] = [];
    for (let i = 0; i < dashboards.length; i +=1) {
      const id: string[] = dashboards[i].dashboard.split('/');
      const dashboard = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        id[id.length - 1]
      )) as Resource;
      dashboardList.push(dashboard);
    }
    setDashBoards(dashboardList);
    setSelectedDashBoard(dashboardList[0]);
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
            selectDashBoard(id);
          }}
          position="left"
        >
          {selectedDashBoard ? 'Result Table Under Construction' : null}
        </TabList>
      ) : (
        'No DashBoards are available'
      )}
    </>
  );
};

export default DashBoardList;
