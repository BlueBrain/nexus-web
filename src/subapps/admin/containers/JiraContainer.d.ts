declare type JiraContainerProps = {
  orgLabel: string;
  projectLabel: string;
};
declare const JiraPluginProjectContainer: ({
  orgLabel,
  projectLabel,
}: JiraContainerProps) => JSX.Element;
export default JiraPluginProjectContainer;
