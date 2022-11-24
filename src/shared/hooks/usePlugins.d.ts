export declare type RemotePluginManifest = {
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
    exclude: object;
    displayPriority?: string;
  };
};
export default function usePlugins(): {
  loading: boolean;
  error: Error | null;
  data: RemotePluginManifest | null;
};
