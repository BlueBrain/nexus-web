import graph from './d3-graph';
/**
 * This class will handle stateful aspects of each d3 class instance
 * I did this to make sure React can keep track of instances and destroy them
 * as well as report errors
 *
 * @export
 * @class Graph
 */
export class Graph {
  private renderError?: Error;
  readonly dotGraph: string;
  readonly element: HTMLElement;
  private destroy?: () => void;
  constructor(dotGraph: string, element: HTMLElement) {
    this.dotGraph = dotGraph;
    this.element = element;
  }

  render() {
    try {
      this.destroy = graph(this.dotGraph, this.element);
    } catch (error) {
      this.renderError = error;
    }
  }

  remove() {
    if (this.destroy) {
      this.destroy();
    }
  }

  get error() {
    return this.renderError;
  }
}
