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
  const [panelVisible, setPanelVisible] = React.useState<boolean>(true);

  const loadRelationships = async () => {
    return nexus.GraphAnalytics.relationships(projectLabel, orgLabel);
  };

  const loadTypeStats = async (type: string) => {
    return nexus.GraphAnalytics.properties(projectLabel, orgLabel, type);
  };

  React.useEffect(() => {
    loadRelationships()
      .then(data => {
        // @ts-ignore
        const nodesCount = data._nodes.map(node => node._count);
        const maxValueNode = Math.max(...nodesCount);
        const minValueNode = Math.min(...nodesCount);

        const elements = constructGraphData(data, minValueNode, maxValueNode);

        setElements(elements);
        setGraphData(data);
      })
      .catch(error => console.log('error'));
    return () => {
      setSelectedType(undefined);
    };
  }, []);

  const showType = (type?: string) => {
    setPanelVisible(true);
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

  const getDiameter = (
    count: number,
    minValueNode: number,
    maxValueNode: number
  ) => {
    const min = 20;
    const max = 60;
    const diameter =
      ((count - minValueNode) / (maxValueNode - minValueNode)) * max;
    return diameter < min ? min : diameter;
  };
  const constructPathName = (path: any[]) => {
    return path.map((singlePath: any) => singlePath._name).join('/');
  };
  const getLineWidth = (
    count: number,
    minValueNode: number,
    maxValueNode: number
  ) => {
    const min = 1;
    const max = 8;
    const width =
      ((count - minValueNode) / (maxValueNode - minValueNode)) * max;
    return width < min ? min : width;
  };

  const getEdgeId = (edge: any) => {
    return `${edge._target}-${edge._source}`;
  };

  const constructGraphData = (response: any, min: number, max: number) => {
    const nodes = response._nodes.map((node: any) => ({
      data: { id: node['@id'], label: `${node._name}\n${node._count}` },
      style: {
        width: `${getDiameter(node._count, min, max)}px`,
        height: `${getDiameter(node._count, min, max)}px`,
      },
    }));
    const edges = response._edges.map((edge: any) => ({
      data: {
        id: getEdgeId(edge),
        source: edge._source,
        target: edge._target || edge._source,
        name: constructPathName(edge._path),
      },
      style: {
        width: getLineWidth(edge._count, min, max),
      },
    }));

    return {
      nodes,
      edges,
    };
  };

  return (
    <div style={{ display: 'flex' }} ref={drawerContainer}>
      <ProjectGraph elements={elements} viewType={showType} />
      {selectedType && panelVisible && (
        <ResourceInfoPanel
          drawerContainer={drawerContainer.current}
          onClickClose={() => setSelectedType(undefined)}
          typeStats={selectedType}
          relations={relations}
          panelVisibility={panelVisible}
        />
      )}
    </div>
  );
};

export default ProjectStatsContainer;
