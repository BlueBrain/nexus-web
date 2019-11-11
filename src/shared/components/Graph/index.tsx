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
  const [selectedResource, setSelectedResource] = React.useState<{
    id: string,
    isExternal: boolean,
  }>({
    id: '',
    isExternal: false,
  });

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
      // we should expand a graph here when user clicks on a node 
    }).on('mouseover', 'node', (e: cytoscape.EventObject) => {
      // show a resorce preview tooltip
      console.log(e);
      
      setResourcePreviewCoords({
        x: e.originalEvent.offsetX,
        y: e.originalEvent.offsetY,
      });      
      setShowResourcePreview(true);
      setSelectedResource({
        id: e.target.id(),
        isExternal: e.target.data('isExternal'),
      });      
    }).on('mouseout', 'node', () => setShowResourcePreview(false));

    return () => {
      graph.destroy();
    };
  }, [container, elements, showLabels]);
  
  const onClickGoToResource = () => {
    const { id, isExternal } = selectedResource;    
    onNodeClick && onNodeClick(id, isExternal);
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
      {showResourcePreview && (<Card
        size="small"
        title={`${selectedResource && selectedResource.isExternal ? 'External Resource' : 'Internal Resource'}`}
        style={{
          position: 'absolute',
          top: resourcePreviewCoords.y,
          left: resourcePreviewCoords.x,
          height: '100px',
        }}>
        <Button type="link" onClick={onClickGoToResource}>{selectedResource && selectedResource.id}</Button>
      </Card>)} 
    </div>
  );
};

export default Graph;
