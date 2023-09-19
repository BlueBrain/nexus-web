import { Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { getResourceLabel, isUserInAtLeastOneRealm, labelOf } from '../utils';
import useLocalStorage from './useLocalStorage';
import useNotification from './useNotification';

export function useJiraPlugin() {
  const [
    jiraInaccessibleBecauseOfVPN,
    setJiraInaccessibleBecauseOfVPN,
  ] = React.useState(false);
  const {
    jiraSupportedRealms,
    apiEndpoint,
    httpHeaderForInaccessibleDueToVPN,
  } = useSelector((state: RootState) => state.config);
  const jiraAPIBaseUrl = `${apiEndpoint}/jira`;

  const { identities } = useSelector((state: RootState) => state.auth);
  const isUserInSupportedJiraRealm =
    jiraSupportedRealms === undefined ||
    (!!identities?.data &&
      !!jiraSupportedRealms &&
      isUserInAtLeastOneRealm(identities.data.identities, jiraSupportedRealms));

  const isInaccessibleBecauseNotOnVPN = async () => {
    if (!httpHeaderForInaccessibleDueToVPN) {
      return false;
    }
    try {
      const response = await fetch(`${jiraAPIBaseUrl}/project`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
        },
      });

      const hasNoVPNHeader = !![...response.headers].some(
        (headerKeyValuePair: any) => {
          const [header, _] = headerKeyValuePair;
          return header === httpHeaderForInaccessibleDueToVPN;
        }
      );
      return hasNoVPNHeader;
    } catch (e) {
      return false;
    }
  };

  isInaccessibleBecauseNotOnVPN().then(value => {
    setJiraInaccessibleBecauseOfVPN(value);
  });

  return { isUserInSupportedJiraRealm, jiraInaccessibleBecauseOfVPN };
}

/**
 * Manages our JIRA data model
 *
 * @returns
 */
function useJIRA({
  orgLabel,
  projectLabel,
  resource,
}: {
  orgLabel: string;
  projectLabel: string;
  resource?: Resource;
}) {
  const nexus = useNexusContext();
  const {
    jiraResourceCustomFieldName: nexusResourceFieldName,
    jiraProjectCustomFieldName: nexusProjectName,
    jiraResourceCustomFieldLabel,
    jiraProjectCustomFieldLabel,
  } = useSelector((state: RootState) => state.config);

  const [projectSelf, setProjectSelf] = React.useState<string>();
  React.useEffect(() => {
    nexus.Project.get(orgLabel, projectLabel)
      .then(d => setProjectSelf(d._self))
      .catch(e => {
        notification.error({
          message: 'An error occurred whilst trying to retrieve project',
        });
      });
  }, [orgLabel, projectLabel]);

  const notification = useNotification();

  const [isJiraConnected, setIsJiraConnected] = useLocalStorage<boolean>(
    'isJiraConnected',
    true
  );

  const [jiraAuthUrl, setJiraAuthUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { apiEndpoint, jiraUrl: jiraWebBaseUrl } = useSelector(
    (state: RootState) => state.config
  );
  const jiraAPIBaseUrl = `${apiEndpoint}/jira`;
  const [linkedIssues, setLinkedIssues] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);

  /**
   * First step in auth flow - get url from App which
   * will include OAuth request token. User will visit
   * url to log-in to Jira and authorize access to the
   * Nexus application to authenticate as the user in
   * future.
   */
  const getRequestToken = async () => {
    nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/request-token`,
      })
      .then(response => {
        setJiraAuthUrl(response.value);
      })
      .catch(e => {
        notification.error({
          message: 'Error connecting to Jira',
          description: e.reason ? e.reason : null,
        });
      });
  };

  /**
   * Completes authorization of Nexus user with Jira
   * @param verificationCode code provided by Jira to user
   */
  const connectJira = (verificationCode: string) => {
    nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/access-token`,
        body: JSON.stringify({
          value: verificationCode,
        }),
      })
      .then(response => {
        setIsJiraConnected(true);
      })
      .catch(e => {
        console.log('JIRA NOT COONECTED');
        handleJiraError(e);
      });
  };

  const getProjects = () => {
    return nexus
      .httpGet({
        path: `${jiraAPIBaseUrl}/project`,
        headers: { 'Content-Type': 'application/json' },
      })
      .catch(e => {
        console.log('GET PROJECTS', jiraAPIBaseUrl);
        handleJiraError(e);
      });
  };

  const fetchProjects = () => {
    (async () => {
      setIsLoading(true);
      const projects = await getProjects();
      setProjects(projects);
      setIsLoading(false);
    })();
  };

  /**
   * Given an array of issue objects with just a key attribute
   * fetch the full issue which includes detail not included
   * from response of Search API
   * @param issues array of issue objects with key
   * @returns
   */
  const getFullIssues = async (issues: any[]) =>
    await Promise.all(issues.map(issue => getIssue(issue.key)));
  const getIssue = (issueKey: string) => {
    return nexus
      .httpGet({
        path: `${jiraAPIBaseUrl}/issue/${issueKey}`,
        headers: { 'Content-Type': 'application/json' },
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const getResourceIssues = (resourceSelf: string) => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/search`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jql: `"${jiraResourceCustomFieldLabel}" = "${resourceSelf}"`,
        }),
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const handleJiraError = (e: any) => {
    console.log('@@error jira', e);
    console.log('MESSAGTE', Object.keys(e));
    if (!isJiraConnected) {
      // ignore if we are not connected
      return;
    }
    if ('@type' in e) {
      if (
        e['@type'] === 'AuthorizationFailed' ||
        e['@type'] === 'NoTokenError' ||
        e['@type'] === 'AccessTokenExpected'
      ) {
        setIsJiraConnected(false);
      }

      if (e['@type'] === 'JiraResponseError') {
        const errorContent = JSON.stringify(e.content);

        if (errorContent.indexOf('oauth_problem=token_rejected') > -1) {
          notification.error({
            message: e.reason,
            description:
              'Jira access token is invalid. Re-authorize access to reconnect to Jira.',
          });
          setIsJiraConnected(false);
          return;
        }
        if (errorContent.indexOf('not on the appropriate screen') > -1) {
          notification.error({
            message: e.reason,
            description:
              'It looks as though the Jira project is not configured with the required fields.',
          });
          return;
        }
        if (errorContent.indexOf('Issue Does Not Exist') > -1) {
          notification.error({
            message: e.reason,
            description: 'Jira issue does not exist.',
          });
          return;
        }
        notification.error({
          message: e.reason,
          description: 'content' in e && JSON.stringify(e.content),
        });
        return;
      }

      notification.error({
        message: e['@type'],
        description: 'reason' in e && e.reason,
      });
      return;
    }
    notification.error({
      message: 'Unknown error',
      description: 'An error occurred',
    });
  };

  const getProjectIssues = () => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/search`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jql: `"${jiraProjectCustomFieldLabel}" = "${projectSelf}"`,
        }),
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const createIssue = (
    project: string,
    summary: string,
    description: string
  ) => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/issue`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            description,
            summary,
            project: {
              key: project,
            },
            issuetype: { name: 'Task' }, // TODO: allow selection of issue type
            [nexusResourceFieldName]: resource ? resource._self : '',
            [nexusProjectName]: projectSelf,
            labels: ['discussion'],
          },
        }),
      })
      .then(v => {
        fetchLinkedIssues();
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const linkIssue = (issueUrl: string) => {
    const issueKey = issueUrl.includes('/')
      ? issueUrl.substring(issueUrl.lastIndexOf('/') + 1)
      : issueUrl;

    // check issue exists first
    nexus
      .httpGet({
        path: `${jiraAPIBaseUrl}/issue/${issueKey}`,
        headers: { 'Content-Type': 'application/json' },
      })
      .then(() => {
        fetch(`${jiraAPIBaseUrl}/issue/${issueKey}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
          },
          body: JSON.stringify({
            fields: {
              [nexusResourceFieldName]: resource ? resource._self : '',
              [nexusProjectName]: projectSelf,
              labels: ['discussion'], // TODO: first we should fetch issue to append this label to any existing ones
            },
          }),
        })
          .then(async (response: any) => {
            if (!response.ok) {
              const error = await response.json();
              return Promise.reject(error);
            }
            return fetchLinkedIssues();
          })
          .catch((e: any) => {
            handleJiraError(e);
          });
      })
      .catch(e => handleJiraError(e));
  };

  const unlinkIssue = (issueKey: string) => {
    return fetch(`${jiraAPIBaseUrl}/issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
      },
      body: JSON.stringify({
        fields: {
          [nexusResourceFieldName]: '',
          [nexusProjectName]: '',
          // TODO: should we also remove discussion label?
        },
      }),
    })
      .then(async (response: any) => {
        if (!response.ok) {
          const error = await response.json();
          return Promise.reject(error);
        }
        return fetchLinkedIssues();
      })
      .catch((e: any) => {
        handleJiraError(e);
      });
  };

  const getIssueResources = (issues: any) => {
    const resources = issues.map((issue: any) => {
      if (
        issue.fields[nexusResourceFieldName] &&
        issue.fields[nexusResourceFieldName] !== null
      ) {
        return nexus.httpGet({ path: issue.fields[nexusResourceFieldName] });
      }
      return Promise.resolve();
    });

    return Promise.all(resources);
  };

  const fetchLinkedIssues = () => {
    (async () => {
      try {
        setIsLoading(true);
        const issuesResponse = await (resource
          ? getResourceIssues(resource._self)
          : getProjectIssues());
        if (issuesResponse.issues) {
          const issuesOrderedByLastUpdate = issuesResponse.issues.sort(
            (a: any, b: any) =>
              new Date(b.fields.updated).getTime() -
              new Date(a.fields.updated).getTime()
          );

          const fullIssuesWithComments = await getFullIssues(
            issuesOrderedByLastUpdate
          );

          const resources = (
            await getIssueResources(issuesOrderedByLastUpdate)
          ).filter(r => r !== undefined);

          setLinkedIssues(
            fullIssuesWithComments.map((issue: any) => {
              let resourceLabel = '';
              if (issue.fields[nexusResourceFieldName] !== null) {
                const resource = resources.find(
                  r =>
                    (r as Resource)['_self'] ===
                    issue.fields[nexusResourceFieldName]
                );

                resourceLabel = resource
                  ? getResourceLabel(resource as Resource)
                  : labelOf(
                      decodeURIComponent(issue.fields[nexusResourceFieldName])
                    );
              }

              return {
                resourceLabel,
                key: issue.key,
                id: issue.id,
                summary: issue.fields.summary,
                status: issue.fields.status.name,
                description: issue.fields.description,
                updated: issue.fields.updated,
                self: issue.self,
                commentCount: issue.fields.comment.total,
                resourceSelfUrl:
                  issue.fields[nexusResourceFieldName] === null
                    ? ''
                    : issue.fields[nexusResourceFieldName],
              };
            })
          );
          setIsLoading(false);
        }
      } catch (e) {
        handleJiraError(e);
        setIsLoading(false);
      }
    })();
  };

  React.useEffect(() => {
    if (!isJiraConnected) {
      getRequestToken();
      return;
    }
    fetchProjects();
    fetchLinkedIssues();
  }, [isJiraConnected, projectSelf]);

  return {
    isLoading,
    isJiraConnected,
    jiraAuthUrl,
    connectJira,
    projects,
    linkedIssues,
    jiraWebBaseUrl,
    createIssue,
    linkIssue,
    unlinkIssue,
  };
}

export default useJIRA;
