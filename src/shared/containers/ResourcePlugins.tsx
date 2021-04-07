import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Collapse } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusPlugin } from '../containers/NexusPlugin';
import PluginInfo from '../components/PluginInfo';
import { matchPlugins, pluginsMap, pluginsExcludeMap } from '../utils';
import usePlugins from '../hooks/usePlugins';

const { Panel } = Collapse;

const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
}> = ({ resource, goToResource, empty = null }) => {
  const nexus = useNexusContext();
  const { data: pluginManifest } = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});

  if (!resource) {
    return null;
  }

  const includedPlugins =
    pluginManifest &&
    matchPlugins(pluginsMap(pluginManifest), availablePlugins, resource);

  const excludedPlugins =
    pluginManifest &&
    matchPlugins(pluginsExcludeMap(pluginManifest), availablePlugins, resource);

  const filteredPlugins = includedPlugins?.filter(
    plugin => !excludedPlugins?.includes(plugin)
  );

  console.log('filteredPlugins', filteredPlugins);

  const pluginDataMap = filteredPlugins
    ? filteredPlugins
        .map(pluginName => {
          if (pluginManifest) {
            return pluginManifest[pluginName];
          }
          return null;
        })
        .sort((p1, p2) => {
          if (p1?.displayPriority && p2?.displayPriority) {
            return (
              parseInt(p1.displayPriority, 10) -
              parseInt(p2.displayPriority, 10)
            );
          }
          return 0;
        })
    : [];

  return filteredPlugins && filteredPlugins.length > 0 ? (
    <Collapse
      defaultActiveKey={[...Array(filteredPlugins.length).keys()].map(i =>
        (i + 1).toString()
      )}
      onChange={() => {}}
    >
      {pluginDataMap.map((pluginData, index) => {
        return pluginData ? (
          <Panel
            header={pluginData.name}
            key={(index + 1).toString()}
            extra={<PluginInfo plugin={pluginData} />}
          >
            <div className="resource-plugin" key={`plugin-${pluginData.name}`}>
              <NexusPlugin
                nexusClient={nexus}
                url={pluginData.absoluteModulePath}
                pluginName={pluginData.name}
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
