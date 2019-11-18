import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Button } from 'antd';
import * as cola from 'cytoscape-cola';

import style from './style';

import './GraphComponent.less';

const LAYOUTS: {
  [layoutName: string]: {
    name: string;
    [optionKey: string]: any;
  };
} = {
  COLA: {
    name: 'cola',
    label: 'Graph',
    maxSimulationTime: 1000,
  },
  BREADTH_FIRST: {
    name: 'breadthfirst',
    label: 'Tree',
  },
};

const DEFAULT_LAYOUT = 'BREADTH_FIRST';

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
  onNodeExpand?(id: string, isExternal: boolean): void;
  onNodeHoverOver?(id: string, isExternal: boolean): void;
  onReset?(): void;
  onRecenter?(): void;
}> = ({ elements, onNodeClick, onNodeExpand, onNodeHoverOver, onReset, onRecenter }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showAlert, setShowAlert] = React.useState(true);
  const [layoutBusy, setLayoutBusy] = React.useState(false);
  const [layoutType, setLayoutType] = React.useState(DEFAULT_LAYOUT);
  const [cursorPointer, setCursorPointer] = React.useState<string | null>(null);
  const graph = React.useRef<cytoscape.Core>();

  const forceLayout = () => {
    if (graph.current) {
      setLayoutBusy(true);
      graph.current &&
        graph.current
          .layout({
            ...LAYOUTS[layoutType],
            stop() {
              setLayoutBusy(false);
            },
          })
          .run();
    }
  };

  React.useEffect(() => {
    forceLayout();
  }, [layoutType]);

  React.useEffect(() => {
    if (graph.current) {
      graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
        const { isBlankNode, isExpandable } = e.target.data();
        if (isBlankNode || !isExpandable) {
          return;
        }
        onNodeExpand &&
          onNodeExpand(e.target.id(), e.target.data('isExternal'));
      });
      graph.current.on('taphold', 'node', (e: cytoscape.EventObject) => {
        onNodeClick && onNodeClick(e.target.id(), e.target.data('isExternal'));
      });
      graph.current.on('mouseover', 'node', (e: cytoscape.EventObject) => {
        const { isBlankNode, isExpandable } = e.target.data();

        if (isExpandable) {
          setCursorPointer('pointer');
        } else {
          setCursorPointer('grab');
        }

        if (isBlankNode) return;

        onNodeHoverOver &&
          onNodeHoverOver(e.target.id(), e.target.data('isExternal'));
      });
      graph.current.on('mouseout', 'node', (e: cytoscape.EventObject) => {
        setCursorPointer(null);
      });
      graph.current.on('mousedown', 'node', (e: cytoscape.EventObject) => {
        setCursorPointer('grabbing');
      });
      graph.current.on('mouseup', 'node', (e: cytoscape.EventObject) => {
        setCursorPointer('grab');
      });
    }

    return () => {
      if (graph.current) {
        graph.current.removeListener('tap');
        graph.current.removeListener('taphold');
        graph.current.removeListener('mouseover');
        graph.current.removeListener('mouseout');
        graph.current.removeListener('mousedown');
        graph.current.removeListener('mouseup');
      }
    };
  });

  const handleLayoutClick = (type: string) => () => {
    setLayoutType(type);
  };

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
      <div
        className="graph"
        ref={container}
        style={
          cursorPointer
            ? {
                cursor: cursorPointer,
              }
            : {}
        }
      ></div>
      <div className="legend">
        <div>
          <span className="node -main" />
          Origin
        </div>
        <div>
          <span className="node -external" />
          External Link
        </div>
        <div>
          <span className="node -internal" />
          Internal Link
        </div>
        <div>
          <span className="node -blank-node" />
          Blank Node
        </div>
      </div>
      <div className="top">
        <div className="controls">
          <div>
            {Object.keys(LAYOUTS).map(layoutKey => {
              return (
                <Button
                  disabled={layoutBusy}
                  type={layoutKey === layoutType ? 'primary' : 'default'}
                  onClick={handleLayoutClick(layoutKey)}
                >
                  {LAYOUTS[layoutKey].label}
                </Button>
              );
            })}
          </div>
          <div>
            <Button onClick={onRecenter}>Re-center</Button>
            <Button onClick={onReset}>Reset</Button>
          </div>
        </div>
        {showAlert ? (
          <Alert
            style={{ margin: '7px 5px 0 0' }}
            message="Click and hold to visit a resource"
            type="info"
            closable
            afterClose={() => setShowAlert(false)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Graph;
