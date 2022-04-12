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
  openPlugins: string[];
  studioDefinedPluginsToInclude?: string[];
  builtInPlugins: { key: string; pluginComponent: React.FC }[];
  handleCollapseChange: (pluginName: string) => void;
}> = ({
  resource,
  goToResource,
  empty = null,
  openPlugins,
  studioDefinedPluginsToInclude,
  builtInPlugins,
  handleCollapseChange,
}) => {
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

  const filteredPlugins = includedPlugins
    ?.filter(plugin => !excludedPlugins?.includes(plugin))
    .filter(plugin => {
      if (!studioDefinedPluginsToInclude) {
        return plugin;
      }
      return studioDefinedPluginsToInclude.includes(plugin);
    });

  const pluginDataMap = filteredPlugins
    ? filteredPlugins
        .map(pluginName => {
          if (pluginManifest) {
            return { key: pluginName, ...pluginManifest[pluginName] };
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

  // const orderedPlugins = studioDefinedPluginsToInclude ? studioDefinedPluginsToInclude : pluginDataMap.map(name)
  const pluginsToDisplay = studioDefinedPluginsToInclude
    ? studioDefinedPluginsToInclude
    : [...pluginDataMap.map(p => p?.key), ...builtInPlugins.map(p => p.key)];

  return (
    <>
      {pluginsToDisplay.map((p, index) => {
        if (!p) return null;
        if (builtInPlugins.map(p => p.key).includes(p)) {
          // this is a built in plugin
          return builtInPlugins.find(b => b.key === p)?.pluginComponent;
        } else {
          // standard plugin
          const pluginData = pluginDataMap.find(pluginX => pluginX?.key === p);

          return pluginData ? (
            <Collapse
              key={pluginData.name}
              onChange={e => handleCollapseChange(pluginData.name)}
              activeKey={
                openPlugins.includes(pluginData.name)
                  ? pluginData.name
                  : undefined
              }
            >
              <Panel
                header={pluginData.name}
                key={`${pluginData.name}`}
                extra={<PluginInfo plugin={pluginData} />}
              >
                <div
                  className="resource-plugin"
                  key={`plugin-${pluginData.name}`}
                >
                  <NexusPlugin
                    nexusClient={nexus}
                    url={pluginData.absoluteModulePath}
                    pluginName={pluginData.name}
                    resource={resource}
                    goToResource={goToResource}
                  />
                </div>
              </Panel>
            </Collapse>
          ) : null;
        }
      })}
    </>
  );
};

export default ResourcePlugins;
