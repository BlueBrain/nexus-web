import * as React from 'react';
import { useSelector } from 'react-redux';
import { Resource } from '@bbp/nexus-sdk';
import { RootState } from '../store/reducers';
import NexusPlugin from '../containers/NexusPlugin';
import { matchPlugins } from '../utils';
import usePlugins from '../hooks/usePlugins';
import { Collapse } from 'antd';
const { Panel } = Collapse;

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
