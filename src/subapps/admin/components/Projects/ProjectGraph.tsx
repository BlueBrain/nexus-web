import * as React from 'react';
import * as cytoscape from 'cytoscape';
// @ts-ignore
import * as avsdf from 'cytoscape-avsdf';
// @ts-ignore
import * as fcose from 'cytoscape-fcose';

export type ElementNodeData = {
  label: string;
  isOrigin?: boolean;
  id: string;
};

const ProjectGraph: React.FC<{
  elements: any;
  viewType: (type?: string, data?: ElementNodeData) => void;
}> = ({ viewType, elements }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const graph = React.useRef<cytoscape.Core>();

  React.useEffect(() => {
    // cytoscape.use(fcose);
    cytoscape.use(avsdf);

    graph.current = cytoscape({
      elements,
      maxZoom: 1,
      wheelSensitivity: 0.2,
      container: container.current,
      layout: {
        //@ts-ignore
        name: 'avsdf',
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            backgroundColor: 'DarkMagenta',
            'text-wrap': 'wrap',
            color: '#fff',
          },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(name)',
            'font-size': '12px',
            'line-color': 'MediumPurple',
            color: '#fff',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': 'Goldenrod',
          },
        },
      ],
    });

    return () => {
      if (graph.current) {
        graph.current.destroy();
      }
    };
  }, [elements]);

  React.useEffect(() => {
    if (!graph.current) {
      return;
    }
    graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
      viewType && viewType(e.target.id(), e.target.data());
      // change node's color here
    });
    graph.current.on('tap', 'edge', (e: cytoscape.EventObject) => {
      console.log('clicked on an edge!', e.target.id());
    });
    // graph.current.on('mouseover', 'node', (e: cytoscape.EventObject) => {});
    // graph.current.on('mouseout', 'node', (e: cytoscape.EventObject) => {
    //   viewType(undefined);
    // });

    return () => {
      if (!graph.current) {
        return;
      }
      graph.current.removeListener('tap');
    };
  });

  return (
    <div style={{ width: '80%', height: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '1000px',
          backgroundColor: 'black',
        }}
        className="graph"
        ref={container}
      />
    </div>
  );
};

export default ProjectGraph;
