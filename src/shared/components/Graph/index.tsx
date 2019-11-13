import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Button, Tooltip } from 'antd';
import * as cola from 'cytoscape-cola';
import * as dagre from 'cytoscape-dagre';

import './GraphComponent.less';

const LAYOUTS: {
  [layoutName: string]: {
    name: string;
    [key: string]: any;
  };
} = {
  COLA: {
    name: 'cola',
  },
  DAGRE: {
    name: 'dagre',
    rankDir: 'LR',
  },
};

const DEFAULT_LAYOUT = 'DAGRE';

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
  onNodeExpand?(id: string, isExternal: boolean): void;
}> = ({ elements, onNodeClick, onNodeExpand }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showAlert, setShowAlert] = React.useState(true);
  const [layoutType, setLayoutType] = React.useState(DEFAULT_LAYOUT);
  const graph = React.useRef<cytoscape.Core>();

  const forceLayout = () => {
    if (graph.current) {
      graph.current && graph.current.layout(LAYOUTS[layoutType]).run();
    }
  };

  React.useEffect(() => {
    forceLayout();
  }, [layoutType]);

  React.useEffect(() => {
    if (graph.current) {
      graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
        const { visited, isBlankNode } = e.target.data();
        if (visited || isBlankNode) {
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
      selector: 'node',
      style: {
        height: 16,
        width: 16,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
      },
    },
    {
      selector: 'node[label]',
      style: {
        label: 'data(label)',
      },
    },
    {
      selector: 'edge[label]',
      style: {
        label: 'data(label)',
        // this style is not included in the types
        // @ts-ignore
        'edge-text-rotation': 'autorotate',
      },
    },
    {
      selector: '.blank-node',
      style: {
        width: 12,
        height: 12,
        'background-color': 'white',
        'border-color': '#00adee',
        'border-width': 2,
      },
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
    replaceElements(elements);
  }, [JSON.stringify(elements)]);

  React.useEffect(() => {
    cytoscape.use(cola);
    cytoscape.use(dagre);
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
          <div>
            {Object.keys(LAYOUTS).map(layoutKey => {
              return (
                <Button
                  type={layoutKey === layoutType ? 'primary' : 'default'}
                  onClick={handleLayoutClick(layoutKey)}
                >
                  {LAYOUTS[layoutKey].name}
                </Button>
              );
            })}
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
