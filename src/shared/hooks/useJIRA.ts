import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { RootState } from '../store/reducers';
import { getResourceLabel, labelOf, makeProjectUri } from '../utils';
import useLocalStorage from './useLocalStorage';

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

  const nexusResourceFieldName = useSelector(
    (state: RootState) => state.config.jiraResourceCustomFieldName
  );
  const nexusProjectName = useSelector(
    (state: RootState) => state.config.jiraProjectCustomFieldName
  );

  const [isJiraConnected, setIsJiraConnected] = useLocalStorage<boolean>(
    'isJiraConnected',
    false
  );
  const [jiraAuthUrl, setJiraAuthUrl] = React.useState('');
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { apiEndpoint } = useSelector((state: RootState) => state.config);
  const jiraAPIBaseUrl = `${apiEndpoint}/jira`;
  const [jiraWebBaseUrl, setJiraWebBaseUrl] = React.useState<string>();

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
      });
  };

  /**
   * Use Jira auth url to determine jira URL.
   * TODO: get this via config
   */
  React.useEffect(() => {
    if (jiraAuthUrl) {
      const authUrl = jiraAuthUrl.substring(
        0,
        jiraAuthUrl.indexOf('/plugins/servlet')
      );
      setJiraWebBaseUrl(authUrl + '/');
    }
  }, [jiraAuthUrl]);

  React.useEffect(() => {
    if (!isJiraConnected) {
      getRequestToken();
    }
  }, [isJiraConnected]);

  const connectJira = (verificationCode: string) => {
    /* TODO: make request to Delta endpoint v1/jira/access-token
      which should return 200 if successful. From then on, we
      can make requests to JIRA via the Delta Jira endpoints
      which stores our access token for Jira and proxies requests
      for the user to Jira
     */
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
      .catch(r => {
        setIsJiraConnected(false);
        console.log('An error occured whilst trying to authenticate');
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
        path: `${jiraAPIBaseUrl}/project`,
        headers: { 'Content-Type': 'application/json' },
      })
      .catch(e => {
        setIsJiraConnected(false);
      });
  };

  const fetchProjects = () => {
    (async () => {
      const projects = await getProjects();
      setProjects(projects);
    })();
  };

  React.useEffect(() => {
    if (isJiraConnected) {
      fetchProjects();
    }
  }, [isJiraConnected]);

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
        setIsJiraConnected(false);
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
          jql: `"Nexus Resource Url" = "${resourceUrl}"`,
        }),
      })
      .catch(e => {
        setIsJiraConnected(false);
      });
  };

  const getProjectIssues = () => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/search`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jql: `"Nexus Project" = "${getProjectUrl()}"` }),
      })
      .catch(e => {
        setIsJiraConnected(false);
      });
  };

  const getProjectUrl = () =>
    `${fusionBaseUrl}${makeProjectUri(orgLabel, projectLabel)}`;

  const createIssue = (project: string, summary: string) => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}/issue`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            project: {
              key: project,
            },
            issuetype: { name: 'Task' }, // TODO: allow selection of issue type
            description: '* Created by Nexus Fusion - add some detail.', // TODO: set to something sensible
            summary,
            [nexusResourceFieldName]: resourceID ? getResourceUrl() : '', // TODO: get custom field name
            [nexusProjectName]: getProjectUrl(), // TODO: get custom field name
            labels: ['discussion'],
          },
        }),
      })
      .then(v => {
        fetchLinkedIssues();
      })
      .catch(e => {
        setIsJiraConnected(false);
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
      },
      body: JSON.stringify({
        fields: {
          [nexusResourceFieldName]: resourceID ? getResourceUrl() : '',
          [nexusProjectName]: `${fusionBaseUrl}${makeProjectUri(
            orgLabel,
            projectLabel
          )}`, // TODO: get custom field name
          labels: ['discussion'], // TODO: first we should fetch issue to append this label to any existing ones
        },
      }),
    })
      .then(response => {
        fetchLinkedIssues();
      })
      .catch(e => {
        setIsJiraConnected(false);
      });
  };
  const unlinkIssue = (issueKey: string) => {
    return fetch(`${jiraAPIBaseUrl}/issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          [nexusResourceFieldName]: '', // TODO: get custom field name
          [nexusProjectName]: '', // TODO: get custom field name
          // TODO: should we also remove discussion label?
        },
      }),
    })
      .then(response => {
        fetchLinkedIssues();
      })
      .catch(e => {
        setIsJiraConnected(false);
      });
  };

  const [linkedIssues, setLinkedIssues] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);

  const getResourceIdFromFusionUrl = (url: string) => {
    return decodeURIComponent(
      decodeURIComponent(
        url.replace(
          `${fusionBaseUrl}${orgLabel}/${projectLabel}/resources/`,
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
              resourceLabel: resourceLabel,
            };
          })
        );
        setIsInitialized(true);
      }
    })();
  };
  React.useEffect(() => {
    fetchLinkedIssues();
  }, []);

  return {
    isInitialized,
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
