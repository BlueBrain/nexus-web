import * as React from 'react';

import ProjectGraph from '../components/Projects/ProjectGraph';
import ResourceInfoPanel from '../components/Projects/ResourceInfoPanel';

const ProjectStatsContainer: React.FC<{}> = () => {
  const [selectedType, setSelectedType] = React.useState<string>();

  React.useEffect(() => {
    // load graph here
  }, []);

  React.useEffect(() => {
    console.log('supposed to fetch data here...');
  }, [selectedType]);

  const showType = (type?: string) => {
    setSelectedType(type);
  };

  return (
    <div style={{ display: 'flex' }}>
      <ProjectGraph viewType={showType} />
      {selectedType && <ResourceInfoPanel typeInfo={selectedType} />}
    </div>
  );
};

export default ProjectStatsContainer;
