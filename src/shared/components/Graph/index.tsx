import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Switch, Button, Card } from 'antd';

import { number } from '@storybook/addon-knobs';

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
}> = ({ elements, onNodeClick }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);

  React.useEffect(() => {
    const graph = cytoscape({
      elements,
      container: container.current,
      style: [
        {
          selector: 'node[label]',
          style: {
            label: 'data(label)',
          },
        },
        {
          selector: 'edge[label]',
          style: showLabels
            ? {
                label: 'data(label)',
                // this style is not included in the types
                // @ts-ignore
                'edge-text-rotation': 'autorotate',
              }
            : {},
        },
        {
          selector: '.external',
          style: {
            'background-color': '#00adee',
          },
        },
        {
          selector: '.internal',
          style: {
            'background-color': '#ff6666',
          },
        },
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 100,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 10,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    })
      .on('tap', 'node', (e: cytoscape.EventObject) => {
        // TODO: expand a graph here?
      })
      .on('taphold', 'node', (e: cytoscape.EventObject) => {
        onNodeClick && onNodeClick(e.target.id(), e.target.data('isExternal'));
      });

    return () => {
      graph.destroy();
    };
  }, [container, elements, showLabels]);

  return (
    <div>
      <div>
        <Switch
          checkedChildren={'hide labels'}
          unCheckedChildren={'show labels'}
          checked={showLabels}
          onChange={() => setShowLabels(!showLabels)}
        />
      </div>
      <div style={{ padding: '20px 0 0' }}>
        {showAlert ? (
          <Alert
            message="Click and hold to visit a resource"
            type="info"
            closable
            afterClose={() => setShowAlert(false)}
          />
        ) : null}
      </div>
      <div
        ref={container}
        style={{
          background: 'white',
          height: '600px',
          width: '100%',
          marginTop: '1em',
        }}
      ></div>
    </div>
  );
};

export default Graph;
