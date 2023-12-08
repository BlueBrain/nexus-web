import { Resource } from '@bbp/nexus-sdk/es';

import JIRAPluginUI, { AuthorizeJiraUI } from '../../components/JIRA/JIRA';
import useJIRA from '../../hooks/useJIRA';

type JIRAPluginContainerProps = {
  resource: Resource;
  projectLabel: string;
  orgLabel: string;
};

const JIRAPluginContainer = ({
  resource,
  projectLabel,
  orgLabel,
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
    isLoading,
  } = useJIRA({
    projectLabel,
    orgLabel,
    resource,
  });
  const tableIssues = linkedIssues?.map(issue => ({
    key: issue.key,
    summary: issue.summary,
    description: issue.description,
    updated: issue.updated,
    status: issue.status,
    url: `${jiraWebBaseUrl}/browse/${issue.key}`,
    commentCount: issue.commentCount,
  }));

  return !isJiraConnected ? (
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
      onCreateIssue={(project, summary, description) =>
        createIssue(project, summary, description)
      }
      onLinkIssue={issueUrl => linkIssue(issueUrl)}
      onUnlinkIssue={issueKey => unlinkIssue(issueKey)}
      searchJiraLink={`${jiraWebBaseUrl}/issues/?jql=`}
      isLoading={isLoading}
    />
  );
};

export default JIRAPluginContainer;
