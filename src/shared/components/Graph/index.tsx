import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Switch, Button, Card } from 'antd';

import { Switch, Button, Tooltip } from 'antd';

import './GraphComponent.less';

const DEFAULT_LAYOUT = {
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
};

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
}> = ({ elements, onNodeClick }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const graph = React.useRef<cytoscape.Core>();

  const handleLayoutClick = (type: string) => () => {
    if (type === 'center') {
      graph.current && graph.current.layout(DEFAULT_LAYOUT).run();
      return;
    }
    if (type === 'lines') {
      graph.current && graph.current.layout({ name: 'breadthfirst' }).run();
      return;
    }
    if (type === 'grid') {
      graph.current && graph.current.layout({ name: 'grid' }).run();
      return;
    }
  };

  React.useEffect(() => {
    graph.current = cytoscape({
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

      layout: DEFAULT_LAYOUT,
    })
      .on('tap', 'node', (e: cytoscape.EventObject) => {
        // TODO: expand a graph here?
      })
      .on('taphold', 'node', (e: cytoscape.EventObject) => {
        onNodeClick && onNodeClick(e.target.id(), e.target.data('isExternal'));
      });

    return () => {
      graph.current && graph.current.destroy();
    };
  }, [container, elements, showLabels]);

  return (
    <div className="graph-component">
      <div className="graph" ref={container}></div>
      {!!graph.current && (
        <div className="controls">
          <Switch
            checkedChildren={'hide labels'}
            unCheckedChildren={'show labels'}
            checked={showLabels}
            onChange={() => {
              setShowLabels(!showLabels);
            }}
          />
          <Tooltip title="Recenter">
            <Button icon="border-inner" onClick={handleLayoutClick('center')} />
          </Tooltip>
          <Tooltip title="Array nodes in lines">
            <Button icon="small-dash" onClick={handleLayoutClick('lines')} />
          </Tooltip>
          <Tooltip title="Array nodes as grid">
            <Button icon="table" onClick={handleLayoutClick('grid')} />
          </Tooltip>
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
        </div>
      )}
    </div>
  );
};

export default Graph;
