import * as React from 'react';
import { useSelector } from 'react-redux';
import { Resource } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import  NexusPlugin  from '../containers/NexusPlugin';
import { matchPlugins } from '../utils';
import usePlugins from '../hooks/usePlugins';



const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
}> = ({ resource, goToResource, empty = null }) => {

  const pluginManifest = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});
  const pluginMap = useSelector((state: RootState) => state.config.pluginsMap);

  if (!resource) {
    return null;
  }

  const filteredPlugins =
    pluginMap && matchPlugins(pluginMap, availablePlugins, resource);

  return filteredPlugins && filteredPlugins.length > 0 ? (
    <>
      {filteredPlugins.map(pluginName => (
        <div className="resource-plugin" key={`plugin-${pluginName}`}>
          <NexusPlugin
            pluginName={pluginName}
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
