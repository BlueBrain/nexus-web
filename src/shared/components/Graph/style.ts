const COLORS = {
  line: '#8a8b8b',
  blankNode: '#faad14',
  external: '#00adee',
  internal: '#ff6666',
  background: 'white',
};

const nodeStyles = [
  {
    selector: 'node',
    style: {
      height: 18,
      width: 18,
      opacity: 0,
      'transition-property': 'background-color border-color',
      'transition-duration': '0.3s',
      'transition-timing-function': 'ease-in-sine',
    },
  },
  {
    selector: 'node[?isExternal]',
    style: {
      'background-color': COLORS.background,
      'border-color': COLORS.external,
      'border-width': 2,
    },
  },
  {
    selector: 'node[!isExternal]',
    style: {
      'background-color': COLORS.internal,
      'border-color': COLORS.internal,
      'border-width': 2,
    },
  },
  {
    selector: 'node[?isBlankNode]',
    style: {
      width: 12,
      height: 12,
      'background-color': COLORS.background,
      'border-color': COLORS.blankNode,
      'border-width': 2,
    },
  },
  {
    selector: 'node[?isExpandable]',
    style: {
      height: 26,
      width: 26,
    },
  },
  {
    selector: 'node[!isExpandable][!isExternal][!isBlankNode]',
    style: {
      'background-color': COLORS.background,
      'border-color': COLORS.internal,
      'border-width': 2,
    },
  },
  {
    selector: 'node[?isOrigin]',
    style: {
      height: 32,
      width: 32,
      shape: 'diamond',
    },
  },
  {
    selector: 'node[?isExpanded]',
    style: {
      'background-color': COLORS.background,
      'border-color': COLORS.internal,
      'border-width': 2,
    },
  },
];
const edgeStyles = [
  {
    selector: 'edge',
    style: {
      width: 2,
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': COLORS.line,
      'line-color': COLORS.line,
    },
  },
];

const labelStyles = [
  {
    selector: 'node[label]',
    style: {
      'text-margin-y': -10,
      'text-outline-color': 'white',
      'text-outline-width': 2,
      label: 'data(label)',
    },
  },
  {
    selector: 'edge[label]',
    style: {
      label: 'data(label)',
      'text-outline-color': 'white',
      'text-outline-width': 2,
      'edge-text-rotation': 'autorotate',
    },
  },
];

export default [...nodeStyles, ...edgeStyles, ...labelStyles];
