import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import ProjectGraph from '../components/Projects/ProjectGraph';
import ResourceInfoPanel from '../components/Projects/ResourceInfoPanel';

const ProjectStatsContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const drawerContainer = React.useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = React.useState<any>();
  const [elements, setElements] = React.useState<any>();
  const [relations, setRelations] = React.useState<any>();
  const [graphData, setGraphData] = React.useState<any>();

  const loadRelationships = async () => {
    return nexus.GraphAnalytics.relationships(projectLabel, orgLabel);
  };

  const loadTypeStats = async (type: string) => {
    return nexus.GraphAnalytics.properties(projectLabel, orgLabel, type);
  };

  React.useEffect(() => {
    loadRelationships()
      .then(data => {
        const elements = constructGraphData(data);

        setElements(elements);
        setGraphData(data);
      })
      .catch(error => console.log('error'));
    return () => {
      setSelectedType(undefined);
    };
  }, []);

  const showType = (type?: string) => {
    if (type) {
      loadTypeStats(type).then(response => {
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

  const getDiameter = (count: number) => {
    const min = 20;
    const max = 120;

    const maxCount = 25000;

    const diameter = (count / maxCount) * max;

    return diameter < min ? min : diameter;
  };

  const constructGraphData = (response: any) => {
    const nodes = response._nodes.map((node: any) => ({
      data: { id: node['@id'], label: `${node._name}\n${node._count}` },
      style: {
        width: `${getDiameter(node._count)}px`,
        height: `${getDiameter(node._count)}px`,
      },
    }));

    return {
      nodes,
      // edges,
      // are not constructed properly because of this: https://github.com/BlueBrain/nexus/issues/2871
      edges: [],
    };
  };

  return (
    <div style={{ display: 'flex' }} ref={drawerContainer}>
      <ProjectGraph elements={elements} viewType={showType} />
      {selectedType && (
        <ResourceInfoPanel
          drawerContainer={drawerContainer.current}
          onClickClose={() => setSelectedType(undefined)}
          typeStats={selectedType}
          relations={relations}
        />
      )}
    </div>
  );
};

export default ProjectStatsContainer;
