import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Empty } from 'antd';

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
      {plugins && plugins.length > 0 ? (
        plugins.map(pluginName => (
          <div className="dashboard-plugin">
            <NexusPlugin
              url={`/public/plugins/${pluginName}/index.js`}
              nexusClient={nexus}
              resource={resourceId}
            />
          </div>
        ))
      ) : (
        <Empty description="No plugins configured" />
      )}
    </div>
  );
};

export default Dashboard;
