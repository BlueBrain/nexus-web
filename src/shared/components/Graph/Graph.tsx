import * as React from 'react';
import * as cytoscape from 'cytoscape';

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick: (id: string) => void;
}> = ({ elements, onNodeClick }) => {
  const container = React.useRef<HTMLDivElement>(null);

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
          style: {
            // @ts-ignore
            'edge-text-rotation': 'autorotate',
            label: 'data(label)',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
      },
    }).on('tap', 'node', (e: cytoscape.EventObject) => {
      console.log(e.target.data.id);

      // const id = this .data('id');
      // onNodeClick(this.data('id'))
    });

    return () => {
      graph.destroy();
    };
  }, [container, elements]);

  return (
    <div
      ref={container}
      style={{
        background: 'white',
        height: '400px',
        width: '100%',
      }}
    ></div>
  );
};

export default Graph;
