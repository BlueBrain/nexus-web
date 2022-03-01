import { Collapse } from 'antd';
import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import JIRAPluginUI, { AuthorizeJiraUI } from '../../components/JIRA/JIRA';
import useJIRA from '../../hooks/useJIRA';

type JIRAPluginContainerProps = {
  resource: Resource;
  projectLabel: string;
  orgLabel: string;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};

const JIRAPluginContainer = ({
  resource,
  projectLabel,
  orgLabel,
  collapsed,
  handleCollapseChanged,
}: JIRAPluginContainerProps) => {
  const {
    projects,
    linkedIssues,
    jiraWebBaseUrl,
    createIssue,
    linkIssue,
    unlinkIssue,
    isJiraConnected,
    jiraAuthUrl,
    connectJira,
    isInitialized,
  } = useJIRA({
    resourceID: resource['@id'],
    projectLabel: projectLabel,
    orgLabel: orgLabel,
  });
  const tableIssues = linkedIssues?.map(issue => ({
    key: issue.key,
    summary: issue.summary,
    description: issue.description,
    updated: issue.updated,
    status: issue.status,
    url: `${jiraWebBaseUrl}browse/${issue.key}`,
    commentCount: issue.commentCount,
  }));

  return (
    <Collapse
      onChange={handleCollapseChanged}
      activeKey={collapsed ? 'jira' : undefined}
    >
      <Collapse.Panel header="JIRA" key="jira">
        {!isJiraConnected ? (
          <AuthorizeJiraUI
            jiraAuthUrl={jiraAuthUrl}
            onSubmitVerificationCode={verificationCode => {
              connectJira(verificationCode);
            }}
          />
        ) : (
          <JIRAPluginUI
            displayType="resource"
            projects={projects}
            issues={tableIssues}
            onCreateIssue={(project, summary) => createIssue(project, summary)}
            onLinkIssue={issueUrl => linkIssue(issueUrl)}
            onUnlinkIssue={issueKey => unlinkIssue(issueKey)}
            // TODO: this url should be determined by config
            searchJiraLink="http://localhost:8080/issues/?jql="
            isInitialized={isInitialized}
          />
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default JIRAPluginContainer;
