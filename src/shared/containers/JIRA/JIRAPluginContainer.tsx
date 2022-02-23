import { Collapse } from 'antd';
import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import JIRAPluginUI from '../../components/JIRA/JIRA';
import useJIRA from '../../hooks/useJIRA';

type JIRAPluginContainerProps = {
  resource: Resource;
  nexus: NexusClient;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};

const JIRAPluginContainer = ({
  resource,
  nexus,
  collapsed,
  handleCollapseChanged,
}: JIRAPluginContainerProps) => {
  const { linkedIssues, jiraWebBaseUrl } = useJIRA({
    resourceID: resource['@id'],
  });
  const tableIssues = linkedIssues?.map(issue => ({
    key: issue.id,
    name: issue.summary,
    url: `${jiraWebBaseUrl}browse/${issue.key}`,
  }));
  return (
    <Collapse
      onChange={handleCollapseChanged}
      activeKey={collapsed ? 'jira' : undefined}
    >
      <Collapse.Panel header="JIRA" key="jira">
        <JIRAPluginUI issues={tableIssues} />
      </Collapse.Panel>
    </Collapse>
  );
};

export default JIRAPluginContainer;
