import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Switch, Button, Tooltip } from 'antd';
import * as cola from 'cytoscape-cola';

import './GraphComponent.less';

const DEFAULT_LAYOUT = {
  name: 'cola',
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
  onNodeExpand?(id: string, isExternal: boolean): void;
}> = ({ elements, onNodeClick, onNodeExpand }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const graph = React.useRef<cytoscape.Core>();

  if (graph.current) {
    graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
      onNodeExpand && onNodeExpand(e.target.id(), e.target.data('isExternal'));
    });
    graph.current.on('taphold', 'node', (e: cytoscape.EventObject) => {
      onNodeClick && onNodeClick(e.target.id(), e.target.data('isExternal'));
    });
  }

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

  const style = [
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
  ];

  const replaceElements = (elements: cytoscape.ElementDefinition[]) => {
    if (graph.current) {
      graph.current.elements().remove();
      graph.current.add(elements);
      graph.current.layout(DEFAULT_LAYOUT).run();
    }
  };

  React.useEffect(() => {
    graph.current && graph.current.style(style);
  }, [showLabels]);

  React.useEffect(() => {
    replaceElements(elements);
  }, [JSON.stringify(elements)]);

  React.useEffect(() => {
    cytoscape.use(cola);
    graph.current = cytoscape({
      elements,
      style,
      maxZoom: 1,
      wheelSensitivity: 0.2,
      container: container.current,
    });
    replaceElements(elements);
    return () => {
      graph.current && graph.current.destroy();
    };
  }, [container]);

  return (
    <div className="graph-component">
      <div className="graph" ref={container}></div>
      <div className="legend">
        <div>
          <span className="node -external" /> External Link
        </div>
        <div>
          <span className="node -internal" /> Internal Link
        </div>
      </div>
      <div className="top">
        <div className="controls">
          <Switch
            checkedChildren={'hide labels'}
            unCheckedChildren={'show labels'}
            checked={showLabels}
            onChange={() => {
              setShowLabels(!showLabels);
            }}
          />
          <div>
            <Tooltip title="Recenter">
              <Button
                icon="border-inner"
                onClick={handleLayoutClick('center')}
              />
            </Tooltip>
            <Tooltip title="Array nodes in lines">
              <Button icon="small-dash" onClick={handleLayoutClick('lines')} />
            </Tooltip>
            <Tooltip title="Array nodes as grid">
              <Button icon="table" onClick={handleLayoutClick('grid')} />
            </Tooltip>
          </div>
        </div>
        <div className="alert">
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
    </div>
  );
};

export default Graph;
