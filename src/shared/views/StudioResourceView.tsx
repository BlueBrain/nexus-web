import * as React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { notification, Empty } from 'antd';
import { RootState } from '../store/reducers';
import { NexusPlugin } from '../containers/NexusPlugin';
import { getResourceLabel, matchPlugins } from '../utils';

const StudioResourceView: React.FunctionComponent<{}> = () => {
  const nexus = useNexusContext();
  const [filteredPlugins, setFilteredPlugins] = React.useState<string[]>([]);
  const { resourceSelfUri = '' } = useParams();
  const plugins: string[] = useSelector(
    (state: RootState) => state.config.plugins
  );
  const pluginMap = useSelector((state: RootState) => state.config.pluginsMap);
  const history = useHistory();
  const [resource, setResource] = React.useState<Resource | null>();

  React.useEffect(() => {
    setResource(resource);

    let resourceResponse;

    nexus
      .httpGet({
        path: atob(resourceSelfUri),
        headers: { Accept: 'application/json' },
      })
      .then(resource => {
        resourceResponse = resource;
        setResource(resourceResponse);
        if (pluginMap) {
          const newPlugins = matchPlugins(pluginMap, plugins, resource);
          setFilteredPlugins(newPlugins);
        }
      })
      .catch(error => {
        notification.error({
          message: `Could not load Resource`,
          description: error.message,
        });
      });
  }, [resourceSelfUri]);

  const goToStudioResource = (selfUrl: string) => {
    const base64EncodedUri = btoa(selfUrl);
    const studioResourceViewLink = `/studios/studio-resources/${base64EncodedUri}`;

    history.push(studioResourceViewLink);
  };

  if (!resource) return null;

  const label = getResourceLabel(resource);

  return (
    <div className="studio-resource-view">
      <h1>{label}</h1>
      <p>{resource.description}</p>
      {filteredPlugins && filteredPlugins.length > 0 ? (
        filteredPlugins.map(pluginName => (
          <div className="studio-resource-plugin" key={`plugin-${pluginName}`}>
            <NexusPlugin
              url={`/public/plugins/${pluginName}/index.js`}
              nexusClient={nexus}
              resource={resource}
              goToResource={goToStudioResource}
            />
          </div>
        ))
      ) : (
        <Empty description="No plugins configured" />
      )}
    </div>
  );
};

export default StudioResourceView;
