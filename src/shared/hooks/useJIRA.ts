import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { generatePath } from 'react-router-dom';

/* TODO: move this out of here */
const jiraAPIBaseUrl = 'http://localhost:8000/jira/rest/api/2/';
const jiraWebBaseUrl = 'http://localhost:8080/';

/**
 * Manages our JIRA data model
 *
 * @returns
 */
function useJIRA({
  resourceID,
  orgLabel,
  projectLabel,
}: {
  resourceID: string;
  orgLabel: string;
  projectLabel: string;
}) {
  const nexus = useNexusContext();

  const getResourceUrl = () => {
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

  /**
   * Return Jira issues with a given Nexus resource ID
   * @param resourceID
   * @returns
   */
  const getIssues = () => {
    const resourceUrl = getResourceUrl();

    return nexus.httpPost({
      path: `${jiraAPIBaseUrl}search`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jql: `"Nexus Resource Url" = "${resourceUrl}"` }),
    });

    /* alternative using Fetch API */
    // return fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ jql: '"key" = "TEST1-01"' }),
    // }).then(response => {
    //   console.log('jira response', response);
    //   return response.json();
    // });
  };

  const createIssue = (summary: string) => {
    return nexus
      .httpPost({
        path: `${jiraAPIBaseUrl}issue`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            project: {
              key: 'TEST1', // TODO: need to allow option to specify project
            },
            issuetype: { name: 'Task' }, // TODO: allow selection of issue type
            description: 'I was created using Fusion, get me.', // TODO: set to something sensible
            summary,
            customfield_10113: getResourceUrl(), // TODO: get custom field name
          },
        }),
      })
      .then(v => {
        fetchLinkedIssues();
      });
  };
  const linkIssue = (issueKey: string) => {
    // return nexus
    //   .httpPut({
    //     path: `${jiraAPIBaseUrl}issue/${issueKey}`,
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       fields: {
    //         customfield_10113: getResourceUrl(), // TODO: get custom field name
    //       },
    //     }),
    //   })
    //   .then(v => {
    //     fetchLinkedIssues();
    //   });
    return fetch(`${jiraAPIBaseUrl}issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          customfield_10113: getResourceUrl(), // TODO: get custom field name
        },
      }),
    }).then(response => {
      console.log('jira response', response);
      fetchLinkedIssues();
    });
  };
  const unlinkIssue = (issueKey: string) => {
    // return nexus
    //   .httpPut({
    //     path: `${jiraAPIBaseUrl}issue/${issueKey}`,
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       fields: {
    //         customfield_10113: '', // TODO: get custom field name
    //       },
    //     }),
    //   })
    //   .then(v => {
    //     console.log('unlinked issue i guess', v);
    //     fetchLinkedIssues();
    //   });
    return fetch(`${jiraAPIBaseUrl}issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          customfield_10113: '', // TODO: get custom field name
        },
      }),
    }).then(response => {
      console.log('jira response', response);
      fetchLinkedIssues();
    });
  };

  const [linkedIssues, setLinkedIssues] = React.useState<any[]>([]);

  const fetchLinkedIssues = () => {
    (async () => {
      console.log('about to do request');
      const issues = await getIssues();
      console.log({ issues });
      if (issues.issues) {
        setLinkedIssues(
          issues.issues.map((issue: any) => {
            return {
              key: issue.key,
              id: issue.id,
              summary: issue.fields.summary,
              updated: issue.fields.updated,
              self: issue.self,
              commentsCount: 0, // not available in response
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
    linkedIssues,
    jiraWebBaseUrl,
    createIssue,
    linkIssue,
    unlinkIssue,
  };
}

export default useJIRA;
