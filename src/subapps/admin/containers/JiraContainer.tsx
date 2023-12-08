import * as React from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import JIRAPluginUI, { AuthorizeJiraUI } from '../../../shared/components/JIRA/JIRA';
import useJIRA from '../../../shared/hooks/useJIRA';
import { RootState } from '../../../shared/store/reducers';
import { makeResourceUri } from '../../../shared/utils';

type JiraContainerProps = {
  orgLabel: string;
  projectLabel: string;
};

const JiraPluginProjectContainer = ({ orgLabel, projectLabel }: JiraContainerProps) => {
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
    isLoading,
  } = useJIRA({
    projectLabel,
    orgLabel,
  });
  const { apiEndpoint } = useSelector((state: RootState) => state.config);

  const tableIssues = linkedIssues?.map((issue) => ({
    key: issue.key,
    summary: issue.summary,
    description: issue.description,
    updated: issue.updated,
    status: issue.status,
    url: `${jiraWebBaseUrl}/browse/${issue.key}`,
    commentCount: issue.commentCount,
    resourceSelfUrl: issue.resourceSelfUrl,
    resourceLabel: issue.resourceLabel,
  }));

  const goToResource = (orgLabel: string, projectLabel: string, resourceId: string) => {
    history.push(makeResourceUri(orgLabel, projectLabel, encodeURIComponent(resourceId)), {
      background: location,
    });
  };

  const resourceIDFromSelfUrl = (selfUrl: string) => {
    return selfUrl.replace(`${apiEndpoint}/resources/${orgLabel}/${projectLabel}/_/`, '');
  };

  return (
    <>
      {!isJiraConnected ? (
        <AuthorizeJiraUI
          jiraAuthUrl={jiraAuthUrl}
          onSubmitVerificationCode={(verificationCode) => {
            connectJira(verificationCode);
          }}
        />
      ) : (
        <JIRAPluginUI
          displayType="project"
          projects={projects}
          issues={tableIssues}
          onCreateIssue={(project, summary, description) =>
            createIssue(project, summary, description)
          }
          onLinkIssue={(issueUrl) => linkIssue(issueUrl)}
          onUnlinkIssue={(issueKey) => unlinkIssue(issueKey)}
          searchJiraLink={`${jiraWebBaseUrl}/issues/?jql=`}
          onNavigateToResource={(resourceSelfUrl) => {
            const resourceId = resourceIDFromSelfUrl(resourceSelfUrl);
            goToResource(orgLabel, projectLabel, resourceId);
          }}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default JiraPluginProjectContainer;
