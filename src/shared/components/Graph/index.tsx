import * as React from 'react';
import * as cytoscape from 'cytoscape';
import { Switch, Button, Card } from 'antd';
import { number } from '@storybook/addon-knobs';

const Graph: React.FunctionComponent<{
  elements: cytoscape.ElementDefinition[];
  onNodeClick?(id: string, isExternal: boolean): void;
}> = ({ elements, onNodeClick }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = React.useState(false);
  const [showResourcePreview, setShowResourcePreview] = React.useState(false);
  const [resourcePreviewCoords, setResourcePreviewCoords] = React.useState<{
    x?: number,
    y?: number,
  }>({});
  const [selectedResource, setSelectedResource] = React.useState<any>('');

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
      layout: {
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
      },
    }).on('tap', 'node', (e: cytoscape.EventObject) => {
      onNodeClick && onNodeClick(e.target.id(), e.target.data('isExternal'));
    }).on('mouseover', 'node', (e: cytoscape.EventObject) => {
      // show a resorce preview tooltip
      setResourcePreviewCoords({
        x: e.originalEvent.clientX - 100,
        y: e.originalEvent.clientY - 400,
      });
      console.log('e.target.position()', e);
      
      setShowResourcePreview(true);
      setSelectedResource(e.target.id());      
    }).on('mouseout', 'node', () => setShowResourcePreview(false));

    return () => {
      graph.destroy();
    };
  }, [container, elements, showLabels]);
  
  const onClickGoToResource = () => {    
    // onNodeClick(selectedResource, false);
  }

  return (
    <div>
      <div>
        <Switch
          checkedChildren={'hide labels'}
          unCheckedChildren={'show labels'}
          checked={showLabels}
          onChange={() => setShowLabels(!showLabels)}
        />
      </div>
      <div
        ref={container}
        style={{
          background: 'white',
          height: '600px',
          width: '100%',
          marginTop: '1em',
        }}
      ></div>
      <Card
        size="small"
        title="Resource"
        style={{
          display: showResourcePreview ? 'block' : 'none',
          position: 'absolute',
          top: resourcePreviewCoords.y,
          left: resourcePreviewCoords.x,
          height: '100px',
          maxWidth: '300px',
        }}>
        <Button type="link" onClick={onClickGoToResource}>{selectedResource}</Button>
      </Card>   
    </div>
  );
};

export default Graph;
