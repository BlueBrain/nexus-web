import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk/es';
import { Collapse } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusPlugin } from '../containers/NexusPlugin';
import { matchPlugins, pluginsMap, pluginsExcludeMap } from '../utils';
import usePlugins from '../hooks/usePlugins';
import ErrorBoundary from '../../shared/components/ErrorBoundary';

const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
  openPlugins: string[];
  studioDefinedPluginsToInclude?: string[];
  builtInPlugins: {
    key: string;
    name: string;
    pluginComponent: React.ReactNode;
  }[];
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

  const pluginsToDisplay = studioDefinedPluginsToInclude
    ? studioDefinedPluginsToInclude
    : [...pluginDataMap.map(p => p?.key), ...builtInPlugins.map(p => p.key)];

  const Fallback = () => (
    <>
      <h1>Something went wrong</h1>
      <p>
        Check that the shape of the resources matches that required by the
        plugin.
      </p>
    </>
  );

  return (
    <>
      {pluginsToDisplay.map((plugin, index) => {
        if (!plugin) return null;
        if (builtInPlugins.map(p => p.key).includes(plugin)) {
          const builtInComponent = builtInPlugins.find(b => b.key === plugin)
            ?.pluginComponent;
          if (builtInComponent) {
            return (
              <div
                id={`plugin-collapsable-${index}`}
                style={{ marginBottom: 10 }}
                key={`builtin-plugin$-${plugin}`}
              >
                <ErrorBoundary key={plugin} fallback={Fallback}>
                  {builtInComponent}
                </ErrorBoundary>
              </div>
            );
          }
          return null;
        }
        // standard plugin
        const pluginData = pluginDataMap.find(p => p?.key === plugin);

        return pluginData ? (
          <div id={`plugin-collapsable-${index}`} style={{ marginBottom: 10 }}>
            <ErrorBoundary
              fallback={() => (
                <Collapse
                  key={pluginData.name}
                  items={[
                    {
                      key: pluginData.name,
                      label: pluginData.name,
                      children: (
                        <>
                          <h1>Something went wrong.</h1>
                          <p>
                            Check that the shape of the data matches the
                            plugin's expectations.
                          </p>
                        </>
                      ),
                    },
                  ]}
                />
              )}
              key={pluginData.name}
            >
              <Collapse
                key={pluginData.name}
                onChange={e => handleCollapseChange(pluginData.name)}
                activeKey={
                  openPlugins.includes(pluginData.name)
                    ? pluginData.name
                    : undefined
                }
                items={[
                  {
                    key: `${pluginData.name}`,
                    label: `${pluginData.name}`,
                    children: (
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
                    ),
                  },
                ]}
              />
            </ErrorBoundary>
          </div>
        ) : null;
      })}
    </>
  );
};

export default ResourcePlugins;
