/**
 * This component requires SystemJS to be available globally (in window)
 */
import * as React from 'react';
import invariant from 'ts-invariant';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import usePlugins, { RemotePluginManifest } from '../hooks/usePlugins';
import { Empty } from 'antd';

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
  { error: Error | null; loading: boolean }
> {
  private container: React.RefObject<HTMLDivElement>;
  private pluginCallback: () => void;

  constructor(props: NexusPluginClassProps) {
    super(props);
    this.state = { error: null, loading: true };
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
            error: null,
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
        // TODO provide different error templates for different error types
        // EX: plugin found, loaded, but is not properly formatted javascript
        // or EX: plugin cannot be loaded because it was not found at the URL
        this.setState({ error, loading: false });
      });
  }

  componentDidCatch(error: Error) {
    this.setState({ error, loading: false });
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
    this.pluginCallback &&
      typeof this.pluginCallback === 'function' &&
      this.pluginCallback();
  }

  render() {
    if (this.state.error) {
      return <Empty description={this.state.error.message} />;
    }
    if (this.state.loading) {
      // TODO show a beautiful loading skeleton to reduce jank
      return <p>loading plugin {this.props.url}...</p>;
    }
    return <div className="remote-component" ref={this.container}></div>;
  }
}

export type HigherOrderNexusPluginProps<T = any> = {
  pluginName: string;
  resource: Resource<T>;
  goToResource?: (selfURL: string) => void;
};

const HigherOrderNexusPlugin: React.FC<HigherOrderNexusPluginProps> = props => {
  const nexus = useNexusContext();
  const manifest = usePlugins();
  const { pluginName } = props;

  const pluginData = manifest && manifest[pluginName];

  return pluginData ? (
    <NexusPlugin
      {...props}
      nexusClient={nexus}
      url={pluginData.absoluteModulePath}
    />
  ) : (
    <Empty
      description={
        // TODO: write and provide link to documentation https://github.com/BlueBrain/nexus/issues/1054
        <span>
          Plugin <em>{pluginName}</em> is not described in the Plugins manifest
          and cannot be found.
        </span>
      }
    />
  );
};

export default HigherOrderNexusPlugin;
