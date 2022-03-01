import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { generatePath } from 'react-router-dom';
import { getResourceLabel, labelOf, makeProjectUri } from '../utils';
import useLocalStorage from './useLocalStorage';

/* TODO: move this out of here */
const jiraAPIBaseUrl = 'http://localhost:8000/jira/rest/api/2/';
const jiraWebBaseUrl = 'http://localhost:8080/';

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

  const [isJiraConnected, setIsJiraConnected] = useLocalStorage<boolean>(
    'isJiraConnected',
    false
  );
  const [jiraAuthUrl, setJiraAuthUrl] = React.useState('');

  /**
   * First step in auth flow - get url from App which
   * will include OAuth request token. User will visit
   * url to log-in to Jira and authorize access to the
   * Nexus application to authenticate as the user in
   * future.
   */
  const getRequestToken = async () => {
    /* TODO: localhost:9001 is our separate auth app
      This is to updated to the Delta endpoint
      v1/jira/request-token
    */
    fetch(`http://localhost:9001/sessions/connect`, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => {
      response.json().then(res => setJiraAuthUrl(res.url));
    });
  };

  React.useEffect(() => {
    getRequestToken();
  }, []);

  const connectJira = (verificationCode: string) => {
    /* TODO: make request to Delta endpoint v1/jira/access-token
      which should return 200 if successful. From then on, we
      can make requests to JIRA via the Delta Jira endpoints
      which stores our access token for Jira and proxies requests
      for the user to Jira
     */
    setIsJiraConnected(true);
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
    const resourceUrl = `${window.location.origin.toString()}${pathToResource}`;
    return resourceUrl;
  };

  const getProjects = () => {
    return nexus.httpGet({
      path: `${jiraAPIBaseUrl}project`,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const fetchProjects = () => {
    (async () => {
      const projects = await getProjects();
      setProjects(projects);
    })();
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

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
    return nexus.httpGet({
      path: `${jiraAPIBaseUrl}issue/${issueKey}`,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  /**
   * Return Jira issues with a given Nexus resource ID
   * @param resourceID
   * @returns
   */
  const getResourceIssues = () => {
    const resourceUrl = getResourceUrl();

    return nexus.httpPost({
      path: `${jiraAPIBaseUrl}search`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jql: `"Nexus Resource Url" = "${resourceUrl}"` }),
    });
  };

  const getProjectIssues = () => {
    return nexus.httpPost({
      path: `${jiraAPIBaseUrl}search`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jql: `"Nexus Project" = "${getProjectUrl()}"` }),
    });
  };

  const getProjectUrl = () =>
    `${window.location.origin.toString()}${makeProjectUri(
      orgLabel,
      projectLabel
    )}`;

  const createIssue = (project: string, summary: string) => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}issue`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            project: {
              key: project,
            },
            issuetype: { name: 'Task' }, // TODO: allow selection of issue type
            description: '* Created by Nexus Fusion - add some detail.', // TODO: set to something sensible
            summary,
            customfield_10113: resourceID ? getResourceUrl() : '', // TODO: get custom field name
            customfield_10115: getProjectUrl(), // TODO: get custom field name
            labels: ['discussion'],
          },
        }),
      })
      .then(v => {
        fetchLinkedIssues();
      });
  };
  const linkIssue = (issueUrl: string) => {
    const issueKey = issueUrl.includes('/')
      ? issueUrl.substring(issueUrl.lastIndexOf('/') + 1)
      : issueUrl;

    return fetch(`${jiraAPIBaseUrl}issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          customfield_10113: resourceID ? getResourceUrl() : '', // TODO: get custom field name
          customfield_10115: `${window.location.origin.toString()}${makeProjectUri(
            orgLabel,
            projectLabel
          )}`, // TODO: get custom field name
          labels: ['discussion'], // TODO: first we should fetch issue to append this label to any existing ones
        },
      }),
    }).then(response => {
      fetchLinkedIssues();
    });
  };
  const unlinkIssue = (issueKey: string) => {
    return fetch(`${jiraAPIBaseUrl}issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          customfield_10113: '', // TODO: get custom field name
          customfield_10115: '', // TODO: get custom field name
          // TODO: should we also remove discussion label?
        },
      }),
    }).then(response => {
      fetchLinkedIssues();
    });
  };

  const [linkedIssues, setLinkedIssues] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);

  const getResourceIdFromFusionUrl = (url: string) => {
    return decodeURIComponent(
      decodeURIComponent(
        url.replace(
          window.location.origin.toString() +
            `/${orgLabel}/${projectLabel}/resources/`,
          ''
        )
      ) // TODO: check encoding
    );
  };

  const getIssueResources = (issues: any) => {
    const resources = issues.map((issue: any) => {
      if (issue.fields.customfield_10113 !== null) {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(
            getResourceIdFromFusionUrl(issue.fields.customfield_10113)
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
            if (issue.fields.customfield_10113 !== null) {
              const resource = resources.find(
                r =>
                  (r as Resource)['@id'] ===
                  getResourceIdFromFusionUrl(issue.fields.customfield_10113)
              );
              resourceLabel = resource
                ? getResourceLabel(resource as Resource)
                : labelOf(decodeURIComponent(issue.fields.customfield_10113));
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
              resourceUrl: issue.fields.customfield_10113,
              resourceId:
                issue.fields.customfield_10113 === null
                  ? ''
                  : getResourceIdFromFusionUrl(issue.fields.customfield_10113),
              resourceLabel: resourceLabel,
            };
          })
        );
      }
    })();
  };
  React.useEffect(() => {
    fetchLinkedIssues();
  }, []);

  return {
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
