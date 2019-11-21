// All the possible layouts
// for the graph visualizer

export const LAYOUTS: {
  [layoutName: string]: {
    name: string;
    [optionKey: string]: any;
  };
} = {
  cola: {
    name: 'cola',
    label: 'Graph',
    animate: true,
    edgeLength(edge: cytoscape.EdgeSingular) {
      const { label } = edge.data();
      const segments = label.split('/');
      // defines the labels based on the path length
      // if the paths are collapsed, this will give
      // a staggered effect depending how deep the path is.
      // otherwise, they'll remain the same length
      return 100 + segments.length * 100;
    },
  },
  breadthFirst: {
    name: 'breadthfirst',
    label: 'Tree',
    animate: true,
  },
};

export const DEFAULT_LAYOUT = 'breadthFirst';
