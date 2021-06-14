import * as React from 'react';
import * as cytoscape from 'cytoscape';
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

  // const elements = {
  //   nodes: [
  //     {
  //       data: { id: 'Cell', label: 'Cell\n500' },
  //     },
  //     {
  //       data: { id: 'Slice', label: 'Slice\n700' },
  //     },
  //     {
  //       data: { id: 'Trace', label: 'Trace\n3772' },
  //     },
  //     {
  //       data: { id: 'Specimen', label: 'Specimen\n21' },
  //     },
  //     {
  //       data: { id: 'PatchedClamp', label: 'PatchedClamp\n2828' },
  //     },
  //     {
  //       data: { id: 'Person', label: 'Person\n219' },
  //     },
  //   ],
  //   edges: [
  //     {
  //       data: {
  //         id: 'ab',
  //         source: 'Slice',
  //         target: 'Cell',
  //         name: 'derivedFrom',
  //       },
  //     },
  //     {
  //       data: {
  //         id: 'bc',
  //         source: 'Cell',
  //         target: 'Trace',
  //         name: 'derivedFrom',
  //       },
  //     },
  //     {
  //       data: {
  //         id: 'cd',
  //         source: 'Slice',
  //         target: 'Specimen',
  //         name: 'derivedFrom',
  //       },
  //     },
  //     {
  //       data: {
  //         id: 'tt',
  //         source: 'Trace',
  //         target: 'PatchedClamp',
  //         name: 'generatedBy',
  //       },
  //     },
  //     {
  //       data: {
  //         id: 'eu',
  //         source: 'Cell',
  //         target: 'PatchedClamp',
  //         name: 'usedBy',
  //       },
  //     },
  //     {
  //       data: {
  //         id: 'rt',
  //         source: 'Person',
  //         target: 'PatchedClamp',
  //         name: 'agent',
  //       },
  //     },
  //   ],
  // };

  React.useEffect(() => {
    cytoscape.use(fcose);

    graph.current = cytoscape({
      elements,
      maxZoom: 1,
      wheelSensitivity: 0.2,
      container: container.current,
      layout: {
        name: 'fcose',
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            height: '90px',
            width: '90px',
            backgroundColor: '#fff',
            'text-wrap': 'wrap',
            'border-width': 1,
            'border-color': 'teal',
          },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(name)',
            'font-size': '12px',
            width: 2,
            'line-color': 'teal',
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
      console.log('clicked!');
    });
    graph.current.on('mouseover', 'node', (e: cytoscape.EventObject) => {
      viewType && viewType(e.target.id(), e.target.data());
    });
    graph.current.on('mouseout', 'node', (e: cytoscape.EventObject) => {
      viewType(undefined);
    });

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
          height: '400px',
        }}
        className="graph"
        ref={container}
      />
    </div>
  );
};

export default ProjectGraph;
