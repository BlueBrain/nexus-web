import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import ProjectGraph from '../components/Projects/ProjectGraph';
import ResourceInfoPanel from '../components/Projects/ResourceInfoPanel';

const ProjectStatsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [selectedType, setSelectedType] = React.useState<any>();
  const [elements, setElements] = React.useState<any>();
  const [relations, setRelations] = React.useState<any>();
  const [graphData, setGraphData] = React.useState<any>();

  const loadRelationships = async () => {
    // TODO update nexus.js
    return await nexus.httpGet({
      path: `https://dev.nexus.ocp.bbp.epfl.ch/v1/statistics/${orgLabel}/${projectLabel}/relationships`,
    });
  };

  const loadTypeStats = async (type: string) => {
    // TODO update nexus.js
    return await nexus.httpGet({
      path: `https://dev.nexus.ocp.bbp.epfl.ch/v1/statistics/${orgLabel}/${projectLabel}/properties/${encodeURIComponent(
        type
      )}`,
    });
  };

  React.useEffect(() => {
    loadRelationships()
      .then(data => {
        const elements = constructGraphData(data);

        setElements(elements);
        setGraphData(data);
      })
      .catch(error => console.log('error'));
  }, []);

  const showType = (type?: string) => {
    if (type) {
      loadTypeStats(type).then(response => {
        console.log('response', response);
        setSelectedType(response);

        const links = graphData._edges.filter(
          (relation: any) =>
            relation._source === type || relation._target === type
        );

        setRelations(links);
      });
    } else {
      setSelectedType(undefined);
    }
  };

  const constructPathName = (path: any[]) => {
    return path.map((singlePath: any) => singlePath._name).join('/');
  };

  const getDiameter = (count: number) => {
    const min = 20;
    const max = 120;

    const maxCount = 25000;

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
        <ResourceInfoPanel
          onClickClose={() => setSelectedType(undefined)}
          typeStats={selectedType}
          relations={relations}
        />
      )}
    </div>
  );
};

export default ProjectStatsContainer;
