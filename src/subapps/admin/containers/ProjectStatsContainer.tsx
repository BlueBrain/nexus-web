import * as React from 'react';

import ProjectGraph from '../components/Projects/ProjectGraph';
import ResourceInfoPanel from '../components/Projects/ResourceInfoPanel';

const ProjectStatsContainer: React.FC<{}> = () => {
  const [selectedType, setSelectedType] = React.useState<string>();
  const [elements, setElements] = React.useState<any>();

  React.useEffect(() => {
    console.log('fetching graph....');

    const response = {
      _nodes: [
        {
          '@id': 'https://neuroshapes.org/Trace',
          _name: 'Trace',
          _count: 3567,
        },
        {
          '@id': 'https://neuroshapes.org/PatchClamp',
          _name: 'PatchClamp',
          _count: 2578,
        },
        {
          '@id': 'https://neuroshapes.org/Person',
          _name: 'Person',
          _count: 18,
        },
        {
          '@id': 'https://neuroshapes.org/Slice',
          _name: 'Slice',
          _count: 1789,
        },
        {
          '@id': 'https://neuroshapes.org/Specimen',
          _name: 'Specimen',
          _count: 4,
        },
      ],
      _edges: [
        {
          _source: 'https://neuroshapes.org/Trace',
          _target: 'https://neuroshapes.org/PatchClamp',
          _count: 3000,
          _path: [
            {
              '@id': 'https://neuroshapes.org/generatedBy',
              _name: 'generatedBy',
            },
          ],
        },
        {
          _source: 'https://neuroshapes.org/Trace',
          _target: 'https://neuroshapes.org/Person',
          _count: 3000,
          _path: [
            {
              '@id': 'https://neuroshapes.org/contribution',
              _name: 'contribution',
            },
            {
              '@id': 'https://neuroshapes.org/agent',
              _name: 'agent',
            },
          ],
        },
        {
          _source: 'https://neuroshapes.org/Slice',
          _target: 'https://neuroshapes.org/Trace',
          _count: 188,
          _path: [
            {
              '@id': 'https://neuroshapes.org/derivedFrom',
              _name: 'derivedFrom',
            },
          ],
        },
        {
          _source: 'https://neuroshapes.org/Slice',
          _target: 'https://neuroshapes.org/Specimen',
          _count: 789,
          _path: [
            {
              '@id': 'https://neuroshapes.org/derivedFrom',
              _name: 'derivedFrom',
            },
          ],
        },
      ],
    };

    const elements = constructGraphData(response);

    setElements(elements);
  }, []);

  React.useEffect(() => {
    console.log('supposed to fetch resource here...', selectedType);
  }, [selectedType]);

  const showType = (type?: string) => {
    setSelectedType(type);
  };

  const constructPathName = (path: any[]) => {
    return path.map((singlePath: any) => singlePath._name).join('/');
  };

  const getEdgeId = (edge: any) => {
    return edge._target + '-' + edge._source;
  };

  const constructGraphData = (response: any) => {
    const nodes = response._nodes.map((node: any) => ({
      data: { id: node['@id'], label: node._name + '\n' + node._count },
    }));

    const edges = response._edges.map((edge: any) => ({
      data: {
        id: getEdgeId(edge),
        source: edge._source,
        target: edge._target,
        name: constructPathName(edge._path),
      },
    }));

    return {
      nodes,
      edges,
    };
  };

  return (
    <div style={{ display: 'flex' }}>
      <ProjectGraph elements={elements} viewType={showType} />
      {selectedType && <ResourceInfoPanel typeInfo={selectedType} />}
    </div>
  );
};

export default ProjectStatsContainer;
