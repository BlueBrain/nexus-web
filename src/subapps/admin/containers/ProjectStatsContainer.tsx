import * as React from 'react';

import ProjectGraph from '../components/Projects/ProjectGraph';
import ResourceInfoPanel from '../components/Projects/ResourceInfoPanel';
import { labelOf } from '../../../shared/utils';

const ProjectStatsContainer: React.FC<{}> = () => {
  const [selectedType, setSelectedType] = React.useState<any>();
  const [elements, setElements] = React.useState<any>();
  const [relations, setRelations] = React.useState<any>();
  const [graphData, setGraphData] = React.useState<any>();

  React.useEffect(() => {
    console.log('fetching graph....');

    const graphRresponse = {
      _nodes: [
        {
          '@id': 'https://neuroshapes.org/Trace',
          _name: 'Trace',
          _count: 4567,
        },
        {
          '@id': 'https://neuroshapes.org/PatchClamp',
          _name: 'PatchClamp',
          _count: 3567,
        },
        {
          '@id': 'https://neuroshapes.org/Person',
          _name: 'Person',
          _count: 18,
        },
        {
          '@id': 'https://neuroshapes.org/Slice',
          _name: 'Slice',
          _count: 500,
        },
        {
          '@id': 'https://neuroshapes.org/Specimen',
          _name: 'Specimen',
          _count: 57,
        },
        {
          '@id': 'https://neuroshapes.org/Cell',
          _name: 'Cell',
          _count: 1242,
        },
        {
          '@id': 'https://neuroshapes.org/ReconstructedCell',
          _name: 'ReconstructedCell',
          _count: 1100,
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
          _source: 'https://neuroshapes.org/Cell',
          _target: 'https://neuroshapes.org/ReconstructedCell',
          _count: 3000,
          _path: [
            {
              '@id': 'https://neuroshapes.org/usedBy',
              _name: 'usedBy',
            },
          ],
        },
        {
          _source: 'https://neuroshapes.org/Cell',
          _target: 'https://neuroshapes.org/PatchClamp',
          _count: 3000,
          _path: [
            {
              '@id': 'https://neuroshapes.org/generatedBy',
              _name: 'usedBy',
            },
          ],
        },
        {
          _source: 'https://neuroshapes.org/PatchClamp',
          _target: 'https://neuroshapes.org/Person',
          _count: 100,
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
          _source: 'https://neuroshapes.org/Cell',
          _target: 'https://neuroshapes.org/Slice',
          _count: 100,
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
          _count: 8,
          _path: [
            {
              '@id': 'https://neuroshapes.org/derivedFrom',
              _name: 'derivedFrom',
            },
          ],
        },
      ],
    };

    const elements = constructGraphData(graphRresponse);

    setElements(elements);
    setGraphData(graphRresponse);
  }, []);

  const showType = (type?: string) => {
    if (type) {
      console.log('type', type);

      const exampleResponse = {
        '@id': type,
        _name: labelOf(type),
        _count: 3567,
        _properties: [
          {
            '@id': 'http://schema.org/name',
            _name: 'name',
            _count: 3000,
          },
          {
            '@id': 'https://neuroshapes.org/brainLocation',
            _name: 'brainLocation',
            _count: 2000,
            _types: [
              {
                '@id': 'https://neuroshapes.org/BrainLocation',
                _name: 'BrainLocation',
                _count: 100,
              },
            ],
            _properties: [
              {
                '@id': 'https://neuroshapes.org/brainRegion',
                _name: 'brainRegion',
                _count: 1500,
                _types: [
                  {
                    '@id': 'https://neuroshapes.org/BrainRegion',
                    _name: 'BrainRegion',
                    _count: 2000,
                  },
                  {
                    '@id': 'https://neuroshapes.org/Thalamus',
                    _name: 'Thalamus',
                    _count: 1000,
                  },
                  {
                    '@id': 'https://neuroshapes.org/Hipocampus',
                    _name: 'Hipocampus',
                    _count: 500,
                  },
                ],
              },
            ],
          },
        ],
      };

      setSelectedType(exampleResponse);

      const links = graphData._edges.filter(
        (relation: any) =>
          relation._source === type || relation._target === type
      );

      setRelations(links);
    } else {
      setSelectedType(undefined);
    }
  };

  const constructPathName = (path: any[]) => {
    return path.map((singlePath: any) => singlePath._name).join('/');
  };

  const getDiameter = (count: number) => {
    const min = 20;
    const max = 200;

    const maxCount = 10000;

    const diameter = (count / maxCount) * max;

    return diameter < min ? min : diameter;
  };

  const getLineWidth = (count: number) => {
    const min = 1;
    const max = 20;

    const maxCount = 10000;

    const width = (count / maxCount) * max;

    return width < min ? min : width;
  };

  const getEdgeId = (edge: any) => {
    return `${edge._target}-${edge._source}`;
  };

  const constructGraphData = (response: any) => {
    const nodes = response._nodes.map((node: any) => ({
      data: { id: node['@id'], label: `${node._name}\n${node._count}` },
      style: {
        width: `${getDiameter(node._count)} px`,
        height: `${getDiameter(node._count)} px`,
      },
    }));

    const edges = response._edges.map((edge: any) => ({
      data: {
        id: getEdgeId(edge),
        source: edge._source,
        target: edge._target,
        name: constructPathName(edge._path),
      },
      style: {
        width: getLineWidth(edge._count),
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
      {selectedType && (
        <ResourceInfoPanel onClickClose={() => setSelectedType(undefined)} typeStats={selectedType} relations={relations} />
      )}
    </div>
  );
};

export default ProjectStatsContainer;
