import { Collapse } from 'antd';
import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import JIRAPluginUI from '../../components/JIRA/JIRA';
import useJIRA from '../../hooks/useJIRA';

type JIRAPluginContainerProps = {
  resource: Resource;
  projectLabel: string;
  orgLabel: string;
  nexus: NexusClient;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};

const JIRAPluginContainer = ({
  resource,
  projectLabel,
  orgLabel,
  nexus,
  collapsed,
  handleCollapseChanged,
}: JIRAPluginContainerProps) => {
  const {
    linkedIssues,
    jiraWebBaseUrl,
    createIssue,
    linkIssue,
    unlinkIssue,
  } = useJIRA({
    resourceID: resource['@id'],
    projectLabel: projectLabel,
    orgLabel: orgLabel,
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
        <JIRAPluginUI
          issues={tableIssues}
          onCreateIssue={summary => createIssue(summary)}
          onLinkIssue={issueKey => linkIssue(issueKey)}
          onUnlinkIssue={issueKey => unlinkIssue(issueKey)}
          searchJiraLink="http://localhost:8080/issues/?jql="
        />
      </Collapse.Panel>
    </Collapse>
  );
};

export default JIRAPluginContainer;
