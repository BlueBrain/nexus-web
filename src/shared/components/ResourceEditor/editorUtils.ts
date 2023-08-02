import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { has } from 'lodash';
import isValidUrl, {
  isAllowedProtocol,
  isExternalLink,
  isStorageLink,
  isUrlCurieFormat,
} from '../../../utils/validUrl';
import {
  getNormalizedTypes,
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../../utils';
import { TDELink, TDEResource } from '../../store/reducers/data-explorer';
import ResourceResolutionCache, {
  ResourceResolutionFetchFn,
  TPagedResources,
  TResolutionData,
  TResolutionType,
} from './ResourcesLRUCache';

export type TEditorPopoverResolvedAs =
  | 'resource'
  | 'resources'
  | 'external'
  | 'error'
  | undefined;
export type TEditorPopoverResolvedData = {
  open: boolean;
  top: number;
  left: number;
  results?: TDELink | TDELink[];
  resolvedAs: TEditorPopoverResolvedAs;
  resolver?: 'resolver-api' | 'search-api';
  error?: any;
};
type TDeltaError = Error & {
  '@type': string;
  details: string;
};
type TErrorMessage = Error & {
  message: string;
};
type TReturnedResolvedData = Omit<
  TEditorPopoverResolvedData,
  'top' | 'left' | 'open'
>;

export const LINE_HEIGHT = 15;
export const INDENT_UNIT = 4;
export const CODEMIRROR_HOVER_CLASS = 'CodeMirror-hover-tooltip';
export const CODEMIRROR_LINK_CLASS = 'fusion-resource-link';
const NEAR_BY = [0, 0, 0, 5, 0, -5, 5, 0, -5, 0];
const isDownloadableLink = (resource: Resource) => {
  return Boolean(
    resource['@type'] === 'File' || resource['@type']?.includes('File')
  );
};
export const mayBeResolvableLink = (url: string): boolean => {
  return isValidUrl(url) && !isUrlCurieFormat(url) && !isStorageLink(url);
};
export const getDataExplorerResourceItemArray = (
  entity: { orgLabel: string; projectLabel: string },
  data: Resource
) => {
  return (isDownloadableLink(data) && data._mediaType
    ? [
        entity?.orgLabel,
        entity?.projectLabel,
        data['@id'],
        data._rev,
        data._mediaType,
      ]
    : [
        entity?.orgLabel,
        entity?.projectLabel,
        data['@id'],
        data._rev,
      ]) as TDEResource;
};
export const isClickableLine = (url: string) => {
  return (
    isValidUrl(url) &&
    isAllowedProtocol(url) &&
    !isUrlCurieFormat(url) &&
    !isStorageLink(url)
  );
};

export function getTokenAndPosAt(e: MouseEvent, current: CodeMirror.Editor) {
  const node = e.target || e.srcElement;
  const text =
    (node as HTMLElement).innerText || (node as HTMLElement).textContent;
  const editorRect = (e.target as HTMLElement).getBoundingClientRect();
  for (let i = 0; i < NEAR_BY.length; i += 2) {
    const coords = {
      left: e.pageX + NEAR_BY[i],
      top: e.pageY + NEAR_BY[i + 1],
    };
    const pos = current.coordsChar(coords);
    const token = current.getTokenAt(pos);
    const url = token
      ? token.string.replace(/\\/g, '').replace(/\"/g, '')
      : null;
    if (token && url === text) {
      return {
        url,
        coords: {
          left: editorRect.left,
          top: coords.top + LINE_HEIGHT,
        },
      };
    }
  }
  return {
    token: null,
    coords: { left: editorRect.left, top: e.pageY },
  };
}
export const highlightUrlOverlay = (editor: CodeMirror.Editor) => {
  editor.addOverlay({
    token: (stream: any, tall: any, call: any) => {
      const rxWord = '" '; // Define what separates a word
      let ch = stream.peek();
      let word = '';
      // \uE001: end of line
      // \uE000: start of line
      if (rxWord.includes(ch) || ch === '\uE000' || ch === '\uE001') {
        stream.next();
        return null;
      }

      while ((ch = stream.peek()) && !rxWord.includes(ch)) {
        word += ch;
        stream.next();
      }

      if (isClickableLine(word)) return CODEMIRROR_LINK_CLASS;
      return;
    },
  });
};
export async function editorLinkResolutionHandler({
  nexus,
  apiEndpoint,
  orgLabel,
  projectLabel,
  url,
  fetcher,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  url: string;
  orgLabel: string;
  projectLabel: string;
  fetcher?: ResourceResolutionFetchFn;
}): Promise<TReturnedResolvedData> {
  const key = `${orgLabel}/${projectLabel}/${url}`;
  let data: TResolutionData;
  let type: TResolutionType;
  if (fetcher) {
    ({ data, type } = await fetcher(key, {
      fetchContext: {
        nexus,
        apiEndpoint,
        orgLabel,
        projectLabel,
        resourceId: encodeURIComponent(url),
      },
    }));
  } else {
    ({ data, type } = await ResourceResolutionCache.fetch(key, {
      fetchContext: {
        nexus,
        apiEndpoint,
        orgLabel,
        projectLabel,
        resourceId: url,
      },
    }));
  }
  switch (type) {
    case 'resolver-api': {
      const details: Resource = data as Resource;
      const entity = getOrgAndProjectFromResourceObject(details);
      const isDownloadable = isDownloadableLink(details);
      // case-resource: link is resolved as a resource by project resolver
      // next-action: open resource editor
      return {
        resolvedAs: 'resource',
        resolver: 'resolver-api',
        results: {
          isDownloadable,
          _self: details._self,
          title: getResourceLabel(details),
          types: getNormalizedTypes(details['@type']),
          resource: getDataExplorerResourceItemArray(
            entity ?? { orgLabel: '', projectLabel: '' },
            details
          ),
        },
      };
    }
    case 'search-api': {
      const details = data as TPagedResources;
      if (!details._total || (!details._total && isExternalLink(url))) {
        // case-error: link is not resolved by nither project resolver nor nexus search api
        // next-action: throw error and capture it in the catch block
        return {
          error: 'Resource can not be resolved',
          resolvedAs: 'error',
        };
      }
      if (details._total === 1) {
        // case-resource: link is resolved as a resource by nexus search api
        // next-action: open resource editor
        const result = details._results[0];
        const isDownloadable = isDownloadableLink(result);
        const entity = getOrgAndProjectFromResourceObject(result);
        return {
          resolvedAs: 'resource',
          resolver: 'search-api',
          results: {
            isDownloadable,
            _self: result._self,
            title: getResourceLabel(result),
            types: getNormalizedTypes(result['@type']),
            resource: getDataExplorerResourceItemArray(
              entity ?? { orgLabel: '', projectLabel: '' },
              result
            ),
          },
        };
      }
      // case-resources: link is resolved as a list of resources by nexus search api
      // next-action: open resources list in the popover
      return {
        resolvedAs: 'resources',
        resolver: 'search-api',
        results: details._results.map((item: Resource) => {
          const isDownloadable = isDownloadableLink(item);
          const entity = getOrgAndProjectFromResourceObject(item);
          return {
            isDownloadable,
            _self: item._self,
            title: getResourceLabel(item),
            types: getNormalizedTypes(item['@type']),
            resource: getDataExplorerResourceItemArray(
              entity ?? { orgLabel: '', projectLabel: '' },
              item
            ),
          };
        }),
      };
    }
    case 'error':
    default: {
      const details = data as any;
      if (isExternalLink(url)) {
        return {
          resolvedAs: 'external',
          results: {
            _self: url,
            title: url,
            types: [],
          },
        };
      }
      // case-error: link is not resolved by nither project resolver nor nexus search api
      // and it's not an external link
      return {
        error: has(details, 'details')
          ? (details as TDeltaError).details
          : (details as TErrorMessage).message ?? JSON.stringify(details),
        resolvedAs: 'error',
      };
    }
  }
}
