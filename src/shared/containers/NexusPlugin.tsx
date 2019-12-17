/**
 * This component requires SystemJS to be available globally (in window)
 */
import * as React from 'react';
import invariant from 'ts-invariant';

const warningMessage =
  'SystemJS not found. ' +
  'To load plugins, Nexus Web requires SystemJS to be available globally.' +
  ' You can find out more here https://github.com/systemjs/systemjs';

export type NexusPluginProps = {
  url: string;
};

export default class RenderRemoteComponent extends React.Component<
  NexusPluginProps,
  { hasError: boolean; loading: boolean }
> {
  private container: React.RefObject<HTMLDivElement>;
  private pluginCallback: () => void;

  constructor(props: NexusPluginProps) {
    super(props);
    this.state = { hasError: false, loading: true };
    this.container = React.createRef();
    this.pluginCallback = () => {};
    // @ts-ignore
    invariant(window.System, warningMessage);
  }

  componentDidCatch(e: Error) {
    this.setState({ hasError: true, loading: false });
  }

  componentDidMount() {
    // @ts-ignore
    window.System.import(this.props.url)
      .then(
        (module: {
          default: ({ ref }: { ref: HTMLDivElement | null }) => () => void;
        }) => {
          this.setState({
            hasError: false,
            loading: false,
          });
          this.pluginCallback = module.default({ ref: this.container.current });
        }
      )
      .catch((error: Error) => {
        this.setState({ hasError: true, loading: false });
      });
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
