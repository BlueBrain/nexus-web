import { Resource } from '@bbp/nexus-sdk';
export declare function useJiraPlugin(): {
  isUserInSupportedJiraRealm: boolean;
  jiraInaccessibleBecauseOfVPN: boolean;
};
/**
 * Manages our JIRA data model
 *
 * @returns
 */
declare function useJIRA({
  orgLabel,
  projectLabel,
  resource,
}: {
  orgLabel: string;
  projectLabel: string;
  resource?: Resource;
}): {
  isLoading: boolean;
  isJiraConnected: boolean | undefined;
  jiraAuthUrl: string;
  connectJira: (verificationCode: string) => void;
  projects: any[];
  linkedIssues: any[];
  jiraWebBaseUrl: string;
  createIssue: (
    project: string,
    summary: string,
    description: string
  ) => Promise<void>;
  linkIssue: (issueUrl: string) => void;
  unlinkIssue: (issueKey: string) => Promise<void>;
};
export default useJIRA;
