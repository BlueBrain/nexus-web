import * as React from 'react';
import { useSelector } from 'react-redux';

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
  const [manifest, setManifest] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: RemotePluginManifest | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });
  const pluginsPath =
    useSelector((state: RootState) => state.config.pluginsManifestPath) || [];

  React.useEffect(() => {
    if (pluginsPath) {
      setManifest({
        loading: true,
        error: null,
        data: null,
      });
      fetch(`${pluginsPath as string}/manifest.json`)
        .then(resp => resp.json())
        .then(manifest =>
          setManifest({
            loading: false,
            error: null,
            data: Object.keys(manifest).reduce((manifest, pluginName) => {
              manifest[
                pluginName
              ].absoluteModulePath = `${pluginsPath}/${manifest[pluginName].modulePath}`;
              return manifest;
            }, manifest),
          })
        )
        .catch(error =>
          setManifest({
            error,
            loading: false,
            data: null,
          })
        );
    }
  }, []);

  return manifest;
}
