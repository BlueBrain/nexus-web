import * as React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardList from './DashboardListContainer';

type WorkspaceListProps = {
  workSpaceIds: string[];
  orgLabel: string;
  projectLabel: string;
};

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workSpaceIds,
  orgLabel,
  projectLabel,
}) => {
  const [workspaces, setWorkspaces] = React.useState<Resource[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectWorkspace = (id: string) => {
    const w = workspaces.find(w => w['@id'] === id);
    setSelectedWorkspace(w);
  };
  useAsyncEffect(async () => {
    const workSpaceList: Resource[] = [];
    for (let i = 0; i < workSpaceIds.length; i += 1) {
      try {
        const workspace = (await nexus.httpGet({
          path: workSpaceIds[i],
        })) as Resource;
        workSpaceList.push(workspace);
      } catch (error) {
        // TODO: display error to the user
      }
    }
    setWorkspaces(workSpaceList);
    setSelectedWorkspace(workSpaceList[0]);
  }, [orgLabel, projectLabel, workSpaceIds]);
  return (
    <>
      {workspaces.length > 0 ? (
        <TabList
          items={workspaces.map(w => ({
            label: w.label,
            description: w.description,
            id: w['@id'],
          }))}
          onSelected={(id: string) => {
            selectWorkspace(id);
          }}
          defaultActiveId={
            selectedWorkspace ? selectedWorkspace['@id'] : workspaces[0]['@id']
          }
          position="top"
        >
          {selectedWorkspace ? (
            <div className="workspace">
              <DashboardList
                orgLabel={orgLabel}
                projectLabel={projectLabel}
                dashboards={selectedWorkspace['dashboards']}
              />{' '}
            </div>
          ) : null}
        </TabList>
      ) : (
        'No Workspaces are available for this Studio'
      )}
    </>
  );
};

export default WorkspaceList;
