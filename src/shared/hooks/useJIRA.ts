import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';

/* TODO: move this out of here */
const jiraAPIBaseUrl = 'http://localhost:8000/jira/rest/api/2/';
const jiraWebBaseUrl = 'http://localhost:8080/';

/**
 * Manages our JIRA data model
 *
 * @returns
 */
function useJIRA({ resourceID }: { resourceID: string }) {
  const nexus = useNexusContext();

  /**
   * Return Jira issues with a given Nexus resource ID
   * @param resourceID
   * @returns
   */
  const getIssues = (resourceID: string) => {
    /* TODO: search on custom field in Jira where resource ID is stored */
    return nexus.httpPost({
      path: `${jiraAPIBaseUrl}search`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jql: '"key" = "TEST1-01"' }),
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

  const [linkedIssues, setLinkedIssues] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      console.log('about to do request');
      const issues = await getIssues(resourceID);
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
  }, []);

  return {
    linkedIssues,
    jiraWebBaseUrl,
  };
}

export default useJIRA;
