import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Button } from 'antd';
import * as cola from 'cytoscape-cola';

import style from './style';

import './GraphComponent.less';

export const LAYOUTS: {
  [layoutName: string]: {
    name: string;
    [optionKey: string]: any;
  };
} = {
  cola: {
    name: 'cola',
    label: 'Graph',
    edgeLength(edge: cytoscape.EdgeSingular) {
      const { label } = edge.data();
      // lets define the edge lengths based on how long
      // the labels will end up being
      return 50 + label.length * 8;
    },
  },
  breadthFirst: {
    name: 'breadthfirst',
    label: 'Tree',
    animate: true,
  },
};

export const DEFAULT_LAYOUT = 'breadthFirst';

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
  onNodeExpand?(id: string, isExternal: boolean): void;
  onNodeHoverOver?(id: string, isExternal: boolean): void;
  onReset?(): void;
  onCollapse?(): void;
  onLayoutChange?(type: string): void;
  layout?: string;
  collapsed?: boolean;
}> = ({
  elements,
  onNodeClick,
  onNodeExpand,
  onNodeHoverOver,
  onReset,
  collapsed,
  onCollapse,
  onLayoutChange,
  layout = DEFAULT_LAYOUT,
}) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showAlert, setShowAlert] = React.useState(true);
  const [layoutBusy, setLayoutBusy] = React.useState(false);
  const [cursorPointer, setCursorPointer] = React.useState<string | null>(null);
  const graph = React.useRef<cytoscape.Core>();

  const forceLayout = () => {
    if (graph.current) {
      setLayoutBusy(true);
      graph.current &&
        graph.current
          .layout({
            ...LAYOUTS[layout],
            stop() {
              setLayoutBusy(false);
            },
          })
          .run();
    }
  };

  React.useEffect(() => {
    forceLayout();
  }, [layout]);

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
    onLayoutChange && onLayoutChange(type);
  };

  const onRecenter = () => {
    if (graph.current) {
      const origin = graph.current.elements()[0];
      graph.current.center(origin);
    }
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
                  size="small"
                  type={layoutKey === layout ? 'primary' : 'default'}
                  onClick={handleLayoutClick(layoutKey)}
                >
                  {LAYOUTS[layoutKey].label}
                </Button>
              );
            })}
          </div>
          <div>
            <Button
              type={collapsed ? 'primary' : 'default'}
              size="small"
              disabled={layoutBusy}
              onClick={onCollapse}
            >
              {collapsed ? 'Expand Paths' : 'Collapse Paths'}
            </Button>
            <Button disabled={layoutBusy} size="small" onClick={onRecenter}>
              Origin
            </Button>
            <Button disabled={layoutBusy} size="small" onClick={onReset}>
              Reset
            </Button>
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
