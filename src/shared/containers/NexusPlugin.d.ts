/**
 * This component requires SystemJS to be available globally (in window)
 */
import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
export declare type NexusPluginProps<T = any> = {
  url: string;
  resource: Resource<T>;
  goToResource?: (selfURL: string) => void;
};
export declare type NexusPluginClassProps<T = any> = NexusPluginProps<T> & {
  nexusClient: NexusClient;
  pluginName?: string;
};
export declare class NexusPlugin extends React.Component<
  NexusPluginClassProps,
  {
    error: Error | null;
    loading: boolean;
  }
> {
  private container;
  private pluginCallback;
  constructor(props: NexusPluginClassProps);
  loadExternalPlugin(): void;
  componentDidCatch(error: Error): void;
  componentWillUpdate(prevProps: NexusPluginClassProps): void;
  componentDidMount(): void;
  componentWillUnmount(): void;
  render(): JSX.Element;
}
export default NexusPlugin;
