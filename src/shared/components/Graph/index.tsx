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
  nodeSpacing() {
    return 40;
  },
};

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
  onNodeExpand?(id: string, isExternal: boolean): void;
}> = ({ elements, onNodeClick, onNodeExpand }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const [layoutType, setLayoutType] = React.useState(DEFAULT_LAYOUT.name);
  const graph = React.useRef<cytoscape.Core>();

  const forceLayout = () => {
    if (graph.current) {
      if (layoutType === DEFAULT_LAYOUT.name) {
        graph.current && graph.current.layout(DEFAULT_LAYOUT).run();
        return;
      }
      if (layoutType === 'lines') {
        graph.current && graph.current.layout({ name: 'breadthfirst' }).run();
        return;
      }
      if (layoutType === 'grid') {
        graph.current && graph.current.layout({ name: 'grid' }).run();
        return;
      }
    }
  };

  React.useEffect(() => {
    forceLayout();
  }, [layoutType]);

  React.useEffect(() => {
    if (graph.current) {
      graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
        const { visited } = e.target.data();
        if (visited) {
          return;
        }
        onNodeExpand &&
          onNodeExpand(e.target.id(), e.target.data('isExternal'));
      });
      graph.current.on('taphold', 'node', (e: cytoscape.EventObject) => {
        onNodeClick && onNodeClick(e.target.id(), e.target.data('isExternal'));
      });
    }
    return () => {
      if (graph.current) {
        graph.current.removeListener('tap');
        graph.current.removeListener('taphold');
      }
    };
  });

  const handleLayoutClick = (type: string) => () => {
    setLayoutType(type);
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
    {
      selector: '.-visited',
      style: {
        'background-color': '#ffd3d3',
      },
    },
  ];

  const replaceElements = (elements: cytoscape.ElementDefinition[]) => {
    if (graph.current) {
      graph.current.elements().remove();
      graph.current.add(elements);
      forceLayout();
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
                type={
                  layoutType === DEFAULT_LAYOUT.name ? 'primary' : 'default'
                }
                icon="border-inner"
                onClick={handleLayoutClick(DEFAULT_LAYOUT.name)}
              />
            </Tooltip>
            <Tooltip title="Array nodes in lines">
              <Button
                type={layoutType === 'lines' ? 'primary' : 'default'}
                icon="small-dash"
                onClick={handleLayoutClick('lines')}
              />
            </Tooltip>
            <Tooltip title="Array nodes as grid">
              <Button
                type={layoutType === 'grid' ? 'primary' : 'default'}
                icon="table"
                onClick={handleLayoutClick('grid')}
              />
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
