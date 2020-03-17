import * as React from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';

import { RootState } from '../store/reducers';

export type RemotePluginManifest = {
  [pluginName: string]: {
    modulePath: string;
    absoluteModulePath: string;
    name: string;
    description: string;
    version: string;
    tags: string[];
    author: string;
    license: string;
    mapping: object;
  };
};

export default function usePlugins() {
  const [manifest, setManifest] = React.useState<RemotePluginManifest | null>(
    null
  );
  const pluginsPath =
    useSelector((state: RootState) => state.config.pluginsManifestPath) || [];

  React.useEffect(() => {
    if (pluginsPath) {
      fetch(`${pluginsPath as string}/manifest.json`)
        .then(resp => resp.json())
        .then(manifest =>
          setManifest(
            Object.keys(manifest).reduce((manifest, pluginName) => {
              manifest[
                pluginName
              ].absoluteModulePath = `${pluginsPath}/${manifest[pluginName].modulePath}`;
              return manifest;
            }, manifest)
          )
        )
        .catch(error =>
          message.warn(
            `There was an error while loading the plugins manifest : ${error.message}`
          )
        );
    }
  }, []);

  return manifest;
}
