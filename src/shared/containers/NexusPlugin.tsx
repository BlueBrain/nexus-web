/**
 * This component requires SystemJS to be available globally (in window)
 */
import * as React from 'react';
import invariant from 'ts-invariant';
import { NexusClient, Resource } from '@bbp/nexus-sdk/es';
import { Result } from 'antd';

import Loading from '../components/Loading';

const PluginError: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <Result
      status="warning"
      title="Plugin failed to render"
      subTitle={error.message}
    />
  );
};

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
  pluginName?: string;
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
    return (
      <Loading
        size="big"
        loading={this.state.loading}
        loadingMessage={<h3>Loading {this.props.pluginName || 'Plugin'}</h3>}
      >
        {this.state.error ? (
          <PluginError error={this.state.error} />
        ) : (
          <div className="remote-component" ref={this.container}></div>
        )}
      </Loading>
    );
  }
}

export default NexusPlugin;
