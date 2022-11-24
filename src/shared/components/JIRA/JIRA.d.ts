declare const AuthorizeJiraUI: ({
  jiraAuthUrl,
  onSubmitVerificationCode: connect,
}: {
  jiraAuthUrl: string;
  onSubmitVerificationCode: (verificationCode: string) => void;
}) => JSX.Element;
export declare const CreateIssueUI: ({
  displayType,
  projects,
  onOk,
  onCancel,
}: {
  projects: any[];
  onOk: (project: string, summary: string, description: string) => void;
  onCancel: () => void;
  displayType: 'project' | 'resource';
}) => JSX.Element;
export declare const LinkIssueUI: ({
  onOk,
  onCancel,
  searchJiraLink,
}: {
  onOk: (issueUrl: string) => void;
  onCancel: () => void;
  searchJiraLink: string;
}) => JSX.Element;
declare type JIRAPluginUIProps = {
  projects: any[];
  issues: any[];
  onCreateIssue: (
    project: string,
    summary: string,
    description: string
  ) => void;
  onLinkIssue: (issueKey: string) => void;
  onUnlinkIssue: (issueKey: string) => void;
  searchJiraLink: string;
  displayType: 'resource' | 'project';
  onNavigateToResource?: (resourceSelfUrl: string) => void;
  isLoading: boolean;
};
declare const JIRAPluginUI: ({
  projects,
  issues,
  onCreateIssue,
  onLinkIssue,
  onUnlinkIssue,
  searchJiraLink,
  displayType,
  onNavigateToResource,
  isLoading,
}: JIRAPluginUIProps) => JSX.Element;
export default JIRAPluginUI;
export { AuthorizeJiraUI };
