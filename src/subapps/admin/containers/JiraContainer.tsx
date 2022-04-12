import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import JIRAPluginUI, {
  AuthorizeJiraUI,
} from '../../../shared/components/JIRA/JIRA';
import useJIRA from '../../../shared/hooks/useJIRA';
import { makeResourceUri } from '../../../shared/utils';

type JiraContainerProps = {
  orgLabel: string;
  projectLabel: string;
};

const JiraPluginProjectContainer = ({
  orgLabel,
  projectLabel,
}: JiraContainerProps) => {
  const history = useHistory();
  const location = useLocation();
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
    resourceLabel: issue.resourceLabel,
  }));

  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    history.push(
      makeResourceUri(orgLabel, projectLabel, encodeURIComponent(resourceId)),
      {
        background: location,
      }
    );
  };

  return (
    <>
      {!isJiraConnected ? (
        <AuthorizeJiraUI
          jiraAuthUrl={jiraAuthUrl}
          onSubmitVerificationCode={verificationCode => {
            connectJira(verificationCode);
          }}
        />
      ) : (
        <JIRAPluginUI
          displayType="project"
          projects={projects}
          issues={tableIssues}
          onCreateIssue={(project, summary) => createIssue(project, summary)}
          onLinkIssue={issueUrl => linkIssue(issueUrl)}
          onUnlinkIssue={issueKey => unlinkIssue(issueKey)}
          searchJiraLink="https://bbpteam.epfl.ch/project/devissues/issues/?jql="
          onNavigateToResource={resourceId =>
            goToResource(orgLabel, projectLabel, resourceId)
          }
          isInitialized={isInitialized}
        />
      )}
    </>
  );
};

export default JiraPluginProjectContainer;
