import * as React from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';

import { RootState } from '../store/reducers';

export type RemotePluginManifest = {
  [pluginName: string]: {
    modulePath: string;
    name: string;
    description: string;
    version: string;
    tags: string[];
    author: string;
    license: string;
  };
};

export default function usePlugins() {
  const [manifest, setManifest] = React.useState<RemotePluginManifest | {}>({});
  const pluginsPath =
    useSelector((state: RootState) => state.config.pluginsPath) || [];

  React.useEffect(() => {
    if (pluginsPath) {
      fetch(`${pluginsPath as string}/manifest.json`)
        .then(resp => resp.json())
        .then(setManifest)
        .catch(error => message.error(error.message));
    }
  }, []);

  return manifest;
}
