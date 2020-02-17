/**
 * This component requires SystemJS to be available globally (in window)
 */
import * as React from 'react';
import invariant from 'ts-invariant';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

const warningMessage =
  'SystemJS not found. ' +
  'To load plugins, Nexus Web requires SystemJS to be available globally.' +
  ' You can find out more here https://github.com/systemjs/systemjs';

export type NexusPluginProps<T = any> = {
  url: string;
  resource: Resource<T>;
  goToResource?: (selfURL: string) => void;
};

export type NexusPluginClassProps<T = any> = NexusPluginProps<T> & {
  nexusClient: NexusClient;
};

export class NexusPlugin extends React.Component<
  NexusPluginClassProps,
  { hasError: boolean; loading: boolean }
> {
  private container: React.RefObject<HTMLDivElement>;
  private pluginCallback: () => void;

  constructor(props: NexusPluginClassProps) {
    super(props);
    this.state = { hasError: false, loading: true };
    this.container = React.createRef();
    this.pluginCallback = () => {};
    // @ts-ignore
    invariant(window.System, warningMessage);
  }

  loadExternalPlugin() {
    // @ts-ignore
    window.System.import(this.props.url)
      .then(
        (module: {
          default: ({
            ref,
            nexusClient,
            resource,
            goToResource,
          }: {
            ref: HTMLDivElement | null;
            nexusClient?: NexusClient;
            resource: Resource;
            goToResource?: (selfURL: string) => void;
          }) => () => void;
        }) => {
          this.setState({
            hasError: false,
            loading: false,
          });
          this.pluginCallback = module.default({
            ref: this.container.current,
            nexusClient: this.props.nexusClient,
            resource: this.props.resource,
            goToResource: this.props.goToResource,
          });
        }
      )
      .catch((error: Error) => {
        this.setState({ hasError: true, loading: false });
      });
  }

  componentDidCatch(e: Error) {
    this.setState({ hasError: true, loading: false });
  }

  componentWillUpdate(prevProps: NexusPluginClassProps) {
    // Reload the plugin(and pass in new props to it) when props change
    // NOTE: will not reload the plugin if nexusClient or goToResource changes
    // otherwise it will cause too many reloads
    if (
      prevProps.resource !== this.props.resource ||
      prevProps.url !== this.props.url
    ) {
      this.loadExternalPlugin();
    }
  }

  componentDidMount() {
    this.loadExternalPlugin();
  }

  componentWillUnmount() {
    this.pluginCallback();
  }

  render() {
    if (this.state.hasError) {
      return <p>Error loading plugin {this.props.url}</p>;
    }
    if (this.state.loading) {
      return <p>loading plugin {this.props.url}...</p>;
    }
    return <div className="remote-component" ref={this.container}></div>;
  }
}

const HigherOrderNexusPlugin: React.FC<NexusPluginProps> = props => {
  const nexus = useNexusContext();

  return <NexusPlugin nexusClient={nexus} {...props} />;
};

export default HigherOrderNexusPlugin;
