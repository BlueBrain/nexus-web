import { Resource } from '@bbp/nexus-sdk';
declare type JIRAPluginContainerProps = {
  resource: Resource;
  projectLabel: string;
  orgLabel: string;
};
declare const JIRAPluginContainer: ({
  resource,
  projectLabel,
  orgLabel,
}: JIRAPluginContainerProps) => JSX.Element;
export default JIRAPluginContainer;
