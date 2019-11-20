import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Alert, Button } from 'antd';
import * as cola from 'cytoscape-cola';

import style from './style';

import GraphLegend from './GraphLegend';

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
  loading: boolean;
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
  loading,
}) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showAlert, setShowAlert] = React.useState(true);
  const [cursorPointer, setCursorPointer] = React.useState<string | null>(null);
  const layoutInstance = React.useRef<cytoscape.Layouts>();
  const graph = React.useRef<cytoscape.Core>();

  const forceLayout = () => {
    if (graph.current) {
      if (layoutInstance.current) {
        layoutInstance.current.stop();
      }
      layoutInstance.current = graph.current
        .elements()
        .makeLayout({
          ...LAYOUTS[layout],
        })
        .run();
    }
  };

  const handleLayoutClick = (type: string) => () => {
    onLayoutChange && onLayoutChange(type);
  };

  const onRecenter = () => {
    if (graph.current) {
      const origin = graph.current.elements()[0];
      graph.current.center(origin);
    }
  };

  // We must atomically update the elements on the graph
  // Instead of removing them all and injecting new elements
  // so that each element will preserve its positioning
  // which creates a nicer effect for users
  // as the elements won't jump around while navigating
  const updateElements = (elements: cytoscape.ElementDefinition[]) => {
    if (graph.current) {
      // Updating old elements
      graph.current.elements().forEach(graphElement => {
        const match = elements.find(
          dataElement => graphElement.id() === dataElement.data.id
        );
        // update old elements
        if (match) {
          graphElement.data(match.data);
          match.classes && graphElement.classes(match.classes);
          return;
        }
        // delete elements on graph that aren't in the elements list anymore
        graphElement.remove();
      });

      // Adding new elements
      const graphElementIds = graph.current
        .elements()
        .map(element => element.id());
      const newElements = elements.filter(
        element => !graphElementIds.includes(element.data.id || '')
      );
      graph.current.add(newElements);

      // Animate graph with the updated elements
      forceLayout();
    }
  };

  React.useEffect(() => {
    forceLayout();
  }, [layout]);

  React.useEffect(() => {
    updateElements(elements);
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
    graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
      const { isBlankNode, isExpandable } = e.target.data();
      if (isBlankNode || !isExpandable) {
        return;
      }
      onNodeExpand && onNodeExpand(e.target.id(), e.target.data('isExternal'));
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
    return () => {
      if (graph.current) {
        graph.current.removeListener('tap');
        graph.current.removeListener('taphold');
        graph.current.removeListener('mouseover');
        graph.current.removeListener('mouseout');
        graph.current.removeListener('mousedown');
        graph.current.removeListener('mouseup');
        graph.current.destroy();
      }
    };
  }, [container]);

  return (
    <div className="graph-component">
      <div
        className="graph"
        ref={container}
        style={cursorPointer ? { cursor: cursorPointer } : {}}
      ></div>
      <GraphLegend />
      <div className="top">
        <div className="controls">
          <div>
            {Object.keys(LAYOUTS).map(layoutKey => {
              return (
                <Button
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
              onClick={onCollapse}
            >
              {collapsed ? 'Expand Paths' : 'Collapse Paths'}
            </Button>
            <Button size="small" onClick={onRecenter}>
              Origin
            </Button>
            <Button size="small" onClick={onReset}>
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
        {loading && (
          <Alert
            style={{ margin: '7px 5px 0 0' }}
            message="Loading..."
            type="info"
          />
        )}
      </div>
    </div>
  );
};

export default Graph;
