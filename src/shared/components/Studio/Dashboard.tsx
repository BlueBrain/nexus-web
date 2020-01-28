import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { NexusPlugin } from '../../containers/NexusPlugin';

import './Dashboard.less';

const Dashboard: React.FunctionComponent<{
  label?: string;
  description?: string;
  plugins?: string[];
  resourceId: string;
}> = ({ label, description, plugins, resourceId }) => {
  const nexus = useNexusContext();

  return (
    <div className="dashboard">
      <h1>{label}</h1>
      <p>{description}</p>
      {plugins &&
        plugins.map(pluginName => (
          <div className="dashboard-plugin">
            <NexusPlugin
              url={`/public/plugins/${pluginName}/index.js`}
              nexusClient={nexus}
              resource={resourceId}
            />
          </div>
        ))}
    </div>
  );
};

export default Dashboard;
