import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashBoardList from './DashBoardList';

interface WorkSpaceListProps {
  workSpaceIds: string[];
  orgLabel: string;
  projectLabel: string;
}

const WorkSpaceList: React.FunctionComponent<WorkSpaceListProps> = ({
  workSpaceIds,
  orgLabel,
  projectLabel,
}) => {
  const [workSpaces, setWorkSpaces] = React.useState<Resource[]>([]);
  const [selectedWorkSpace, setSelectedWorkSpace] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectWorkSpace = (id: string) => {
    const w = workSpaces.find(w => w['@id'] === id);
    setSelectedWorkSpace(w);
  };
  useAsyncEffect(async () => {
    const workSpaceList: Resource[] = [];
    for (let i = 0; i < workSpaceIds.length; i +=1) {
      const id: string[] = workSpaceIds[i].split('/');
      const dashboard = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        id[id.length - 1]
      )) as Resource;
      workSpaceList.push(dashboard);
    }
    setWorkSpaces(workSpaceList);
    setSelectedWorkSpace(workSpaceList[0]);
  }, [orgLabel, projectLabel, workSpaceIds]);
  return (
    <>
      {workSpaces.length > 0 ? (
        <TabList
          items={workSpaces.map(w => ({
            label: w.label,
            description: w.description,
            id: w['@id'],
          }))}
          onSelected={(id: string) => {
            selectWorkSpace(id);
          }}
          defaultActiveId={
            selectedWorkSpace ? selectedWorkSpace['@id'] : workSpaces[0]['@id']
          }
          position="top"
        >
          {selectedWorkSpace ? (
            <div className="workspace">
              <DashBoardList
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                dashboards={selectedWorkSpace['dashboards']}
              />{' '}
            </div>
          ) : null}
        </TabList>
      ) : (
        'No WorkSpaces are available for this Studio'
      )}
    </>
  );
};

export default WorkSpaceList;
