import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusPlugin } from '../containers/NexusPlugin';
import PluginInfo from './PluginInfo';
import { matchPlugins, pluginsMap } from '../utils';
import usePlugins from '../hooks/usePlugins';

const { Panel } = Collapse;

const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
}> = ({ resource, goToResource, empty = null }) => {
  const nexus = useNexusContext();
  const { data: pluginManifest } = usePlugins();
  console.log('plugins', pluginManifest);

  const availablePlugins = Object.keys(pluginManifest || {});

  if (!resource) {
    return null;
  }

  const filteredPlugins =
    pluginManifest &&
    matchPlugins(pluginsMap(pluginManifest), availablePlugins, resource);

  return filteredPlugins && filteredPlugins.length > 0 ? (
    <Collapse
      defaultActiveKey={[...Array(filteredPlugins.length).keys()].map(i =>
        (i + 1).toString()
      )}
      onChange={() => {}}
    >
      {filteredPlugins.map((pluginName, index) => {
        const pluginData = pluginManifest && pluginManifest[pluginName];
        return pluginData ? (
          <Panel
            header={pluginManifest && pluginManifest[pluginName].name}
            key={(index + 1).toString()}
            extra={<PluginInfo plugin={pluginData} />}
          >
            <div className="resource-plugin" key={`plugin-${pluginName}`}>
              <NexusPlugin
                nexusClient={nexus}
                url={pluginData.absoluteModulePath}
                pluginName={pluginName}
                resource={resource}
                goToResource={goToResource}
              />
            </div>
          </Panel>
        ) : null;
      })}
    </Collapse>
  ) : (
    empty
  );
};

export default ResourcePlugins;
