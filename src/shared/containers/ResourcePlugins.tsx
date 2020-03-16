import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import NexusPlugin from '../containers/NexusPlugin';
import { matchPlugins } from '../utils';
import usePlugins from '../hooks/usePlugins';
import { Collapse } from 'antd';
const { Panel } = Collapse;

export type PluginMapping = {
  [pluginKey: string]: object;
};

const ResourcePlugins: React.FunctionComponent<{
  resource?: Resource;
  goToResource?: (selfURL: string) => void;
  empty?: React.ReactElement;
}> = ({ resource, goToResource, empty = null }) => {
  const pluginManifest = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});
  const pluginsMap = Object.keys(pluginManifest || {}).reduce(
    (mapping, pluginManifestKey) => {
      if (!pluginManifest) {
        return mapping;
      }
      mapping[pluginManifestKey] = pluginManifest[pluginManifestKey].mapping;
      return mapping;
    },
    {} as PluginMapping
  );

  if (!resource) {
    return null;
  }

  const filteredPlugins =
    pluginManifest && matchPlugins(pluginsMap, availablePlugins, resource);

  return filteredPlugins && filteredPlugins.length > 0 ? (
    <Collapse
      defaultActiveKey={[...Array(filteredPlugins.length).keys()].map(i =>
        (i + 1).toString()
      )}
      onChange={() => {}}
    >
      {filteredPlugins.map((pluginName, index) => (
        <Panel
          header={pluginManifest && pluginManifest[pluginName].name}
          key={(index + 1).toString()}
        >
          <div className="resource-plugin" key={`plugin-${pluginName}`}>
            <NexusPlugin
              pluginName={pluginName}
              resource={resource}
              goToResource={goToResource}
            />
          </div>
        </Panel>
      ))}
    </Collapse>
  ) : (
    empty
  );
};

export default ResourcePlugins;
