import * as React from 'react';
import JIRAPluginUI from '../../../shared/components/JIRA/JIRA';
import useJIRA from '../../../shared/hooks/useJIRA';

type JiraContainerProps = {
  orgLabel: string;
  projectLabel: string;
};

const JiraPluginProjectContainer = ({
  orgLabel,
  projectLabel,
}: JiraContainerProps) => {
  const {
    projects,
    linkedIssues,
    jiraWebBaseUrl,
    createIssue,
    linkIssue,
    unlinkIssue,
  } = useJIRA({
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
    resourceId: issue.resourceId,
  }));

  return (
    <JIRAPluginUI
      displayType="project"
      projects={projects}
      issues={tableIssues}
      onCreateIssue={(project, summary) => createIssue(project, summary)}
      onLinkIssue={issueUrl => linkIssue(issueUrl)}
      onUnlinkIssue={issueKey => unlinkIssue(issueKey)}
      searchJiraLink="http://localhost:8080/issues/?jql="
    />
  );
};

export default JiraPluginProjectContainer;
