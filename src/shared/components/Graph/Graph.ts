import graph from './d3-graph';

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
