import * as React from 'react';
import { useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import { NexusPlugin } from '../containers/NexusPlugin';
import { matchPlugins } from '../utils';

const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
}> = ({ resource, goToResource, empty = null }) => {
  const nexus = useNexusContext();
  const plugins: string[] = useSelector(
    (state: RootState) => state.config.plugins
  );
  const pluginMap = useSelector((state: RootState) => state.config.pluginsMap);

  if (!resource) {
    return null;
  }

  const filteredPlugins =
    pluginMap && matchPlugins(pluginMap, plugins, resource);

  return filteredPlugins && filteredPlugins.length > 0 ? (
    <>
      {filteredPlugins.map(pluginName => (
        <div className="resource-plugin" key={`plugin-${pluginName}`}>
          <NexusPlugin
            url={`/public/plugins/${pluginName}/index.js`}
            nexusClient={nexus}
            resource={resource}
            goToResource={goToResource}
          />
        </div>
      ))}
    </>
  ) : (
    empty
  );
};

export default ResourcePlugins;
