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
  handleCollapseChange: (pluginName: string) => void;
}> = ({
  resource,
  goToResource,
  empty = null,
  openPlugins,
  studioDefinedPluginsToInclude,
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
    <>
      {pluginDataMap.map((pluginData, index) => {
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
      })}
    </>
  ) : (
    empty
  );
};

export default ResourcePlugins;
