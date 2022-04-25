import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { RootState } from '../store/reducers';
import { getResourceLabel, labelOf, makeProjectUri } from '../utils';
import useLocalStorage from './useLocalStorage';
import useNotification from './useNotification';

/**
 * Manages our JIRA data model
 *
 * @returns
 */
function useJIRA({
  orgLabel,
  projectLabel,
  resourceID,
}: {
  orgLabel: string;
  projectLabel: string;
  resourceID?: string;
}) {
  const nexus = useNexusContext();
  const basePath =
    useSelector((state: RootState) => state.config.basePath) || '';
  const fusionBaseUrl = `${window.location.origin.toString()}${basePath}`;
  const {
    jiraResourceCustomFieldName: nexusResourceFieldName,
    jiraProjectCustomFieldName: nexusProjectName,
    jiraResourceCustomFieldLabel,
    jiraProjectCustomFieldLabel,
  } = useSelector((state: RootState) => state.config);

  const notification = useNotification();

  const [isJiraConnected, setIsJiraConnected] = useLocalStorage<boolean>(
    'isJiraConnected',
    false
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
        handleJiraError(e);
      });
  };

  const getResourceUrl = () => {
    if (!resourceID) {
      throw new Error('Resource ID not available in this context');
    }
    const encodedResourceId = encodeURIComponent(resourceID);
    const pathToResource = generatePath(
      '/:orgLabel/:projectLabel/resources/:resourceId',
      {
        orgLabel,
        projectLabel,
        resourceId: encodedResourceId,
      }
    );

    const resourceUrl = `${fusionBaseUrl}${pathToResource}`;
    return resourceUrl;
  };

  const getProjects = () => {
    return nexus
      .httpGet({
        path: `${jiraAPIBaseUrl}/project/recent`,
        headers: { 'Content-Type': 'application/json' },
      })
      .catch(e => {
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

  /**
   * Return Jira issues with a given Nexus resource ID
   * @param resourceID
   * @returns
   */
  const getResourceIssues = () => {
    const resourceUrl = getResourceUrl();

    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/search`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jql: `"${jiraResourceCustomFieldLabel}" = "${resourceUrl}"`,
        }),
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const handleJiraError = (e: any) => {
    if (!isJiraConnected) {
      // ignore if we are not connected
      return;
    }
    if ('@type' in e) {
      if (
        e['@type'] === 'AuthorizationFailed' ||
        e['@type'] === 'NoTokenError'
      ) {
        setIsJiraConnected(false);
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
          jql: `"${jiraProjectCustomFieldLabel}" = "${getProjectUrl()}"`,
        }),
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const getProjectUrl = () =>
    `${fusionBaseUrl}${makeProjectUri(orgLabel, projectLabel)}`;

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
            [nexusResourceFieldName]: resourceID ? getResourceUrl() : '',
            [nexusProjectName]: getProjectUrl(),
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

    return fetch(`${jiraAPIBaseUrl}/issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
      },
      body: JSON.stringify({
        fields: {
          [nexusResourceFieldName]: resourceID ? getResourceUrl() : '',
          [nexusProjectName]: `${fusionBaseUrl}${makeProjectUri(
            orgLabel,
            projectLabel
          )}`,
          labels: ['discussion'], // TODO: first we should fetch issue to append this label to any existing ones
        },
      }),
    })
      .then(response => {
        fetchLinkedIssues();
      })
      .catch(e => {
        handleJiraError(e);
      });
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
      .then(response => {
        fetchLinkedIssues();
      })
      .catch(e => {
        handleJiraError(e);
      });
  };

  const getResourceIdFromFusionUrl = (url: string) => {
    if (!url) {
      return '';
    }
    return decodeURIComponent(
      decodeURIComponent(
        url.replace(
          `${fusionBaseUrl}/${orgLabel}/${projectLabel}/resources/`,
          ''
        )
      ) // TODO: check encoding
    );
  };

  const getIssueResources = (issues: any) => {
    const resources = issues.map((issue: any) => {
      if (issue.fields[nexusResourceFieldName] !== null) {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(
            getResourceIdFromFusionUrl(issue.fields[nexusResourceFieldName])
          )
        );
      }
      return Promise.resolve();
    });
    return Promise.all(resources);
  };

  const fetchLinkedIssues = () => {
    (async () => {
      setIsLoading(true);
      const issuesResponse = await (resourceID
        ? getResourceIssues()
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
                  (r as Resource)['@id'] ===
                  getResourceIdFromFusionUrl(
                    issue.fields[nexusResourceFieldName]
                  )
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
              resourceUrl: issue.fields[nexusResourceFieldName],
              resourceId:
                issue.fields[nexusResourceFieldName] === null
                  ? ''
                  : getResourceIdFromFusionUrl(
                      issue.fields[nexusResourceFieldName]
                    ),
            };
          })
        );
        setIsLoading(false);
      }
    })();
  };

  React.useEffect(() => {
    if (!isJiraConnected) {
      getRequestToken();
    }
    fetchProjects();
    fetchLinkedIssues();
  }, [isJiraConnected]);

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
