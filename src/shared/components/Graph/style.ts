import { redirectSuccess } from "redux-oidc";

const style = [
    {
      selector: 'node',
      style: {
        height: 16,
        width: 16,
      },
    },
    {
      selector: '.-expandable',
      style: {
        height: 24,
        width: 24,
      },
    },
    {
      selector: '.-main',
      style: {
        height: 36,
        width: 36,
        shape: 'diamond',
        'background-color': '#9dfcc5',
        'border-color': '#8a8b8b',
        'border-width': 3,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': '#8a8b8b',
      },
    },
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
    {
      selector: '.blank-node',
      style: {
        width: 12,
        height: 12,
        'background-color': 'white',
        'border-color': '#faad14',
        'border-width': 2,
      },
    },
    {
      selector: '.-external',
      style: {
        'background-color': 'white',
        'border-color': '#00adee',
        'border-width': 2,
      },
    },
    {
      selector: '.-internal',
      style: {
        'background-color': '#ff6666',
      },
    },
    {
      selector: '.-internal.-expanded',
      style: {
        'background-color': 'white',
        'border-color': '#ff6666',
        'border-width': 2,
      },
    },
  ];
  
  export default style;