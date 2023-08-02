// NOTE: This file will be removed when delta introduce http cache headers
import { NexusClient, Resource, PaginatedList } from '@bbp/nexus-sdk';
import LRUCache from 'lru-cache';

// TODO: Use nexus.httpGet to prepare for using http cache headers
// since the nexus SDK can not accept the headers as an argument

const parseResourceId = (url: string) => {
  const fileUrlPattern = /files\/([\w-]+)\/([\w-]+)\/(.*)/;
  if (fileUrlPattern.test(url)) {
    const [, , , resourceId] = url.match(fileUrlPattern) as string[];
    return decodeURIComponent(resourceId.split('?rev=')[0]);
  }
  return decodeURIComponent(url);
};

const lookByProjectResolver = async ({
  nexus,
  apiEndpoint,
  orgLabel,
  projectLabel,
  resourceId,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
}): Promise<Resource> => {
  return await nexus.httpGet({
    path: `${apiEndpoint}/resolvers/${orgLabel}/${projectLabel}/_/${encodeURIComponent(
      parseResourceId(resourceId)
    )}`,
  });
};
const lookBySearchApi = async ({
  nexus,
  apiEndpoint,
  resourceId,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  resourceId: string;
}): Promise<TPagedResources> => {
  return await nexus.httpGet({
    path: `${apiEndpoint}/resources?locate=${encodeURIComponent(
      parseResourceId(resourceId)
    )}`,
  });
};

export type TPagedResources = PaginatedList & {
  [key: string]: any;
};
export type TResolutionType = 'resolver-api' | 'search-api' | 'error';
export type TResolutionData = Resource | TPagedResources | Error;
export type TResolutionReturnedData = {
  data: TResolutionData;
  type: TResolutionType;
};
export type ResourceResolutionFetchFn = (
  key: string,
  { fetchContext }: { fetchContext: any }
) => Promise<TResolutionReturnedData>;
type Options = LRUCache.Options<string, TResolutionReturnedData>;

const Options: Options = {
  max: 100,
  ttl: 1000 * 60 * 30, // 30 minutes
  fetchMethod: async (
    _,
    undefined,
    options: LRUCache.FetcherOptions<string, TResolutionReturnedData>
  ) => {
    try {
      return {
        data: await lookByProjectResolver(options.context),
        type: 'resolver-api',
      };
    } catch (error) {
      try {
        return {
          data: await lookBySearchApi(options.context),
          type: 'search-api',
        };
      } catch (error) {
        throw {
          data: error,
          type: 'error',
        };
      }
    }
  },
};
const ResourceResolutionCache = new LRUCache<string, TResolutionReturnedData>(
  Options
);

export default ResourceResolutionCache;
