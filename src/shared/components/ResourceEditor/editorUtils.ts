import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { has } from 'lodash';
import { useDispatch } from 'react-redux';
import useResolvedLinkEditorPopover from '../../molecules/ResolvedLinkEditorPopover/useResolvedLinkEditorPopover';
import isValidUrl, {
  isExternalLink,
  isStorageLink,
  isUrlCurieFormat,
} from '../../../utils/validUrl';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import {
  getNormalizedTypes,
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../../utils';
import { TDELink, TDEResource } from '../../store/reducers/data-explorer';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';
import ResourceResolutionCache, {
  ResourceResolutionFetchFn,
  TPagedResources,
  TResolutionData,
  TResolutionReturnedData,
  TResolutionType,
} from './ResourcesLRUCache';

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
    if (token && token.string === text) {
      return {
        token,
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
        resourceId: encodeURIComponent(url),
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

export const useResourceResoultion = () => {
  const dispatch = useDispatch();
  const {
    navigateResourceHandler,
    downloadBinaryAsyncHandler,
  } = useResolvedLinkEditorPopover();

  return ({
    resolvedAs,
    error,
    results,
    top,
    left,
  }: TEditorPopoverResolvedData) => {
    if (resolvedAs === 'resource') {
      const result = results as TDELink;
      if (result.isDownloadable) {
        return downloadBinaryAsyncHandler({
          orgLabel: result.resource?.[0]!,
          projectLabel: result.resource?.[1]!,
          resourceId: result.resource?.[2]!,
          ext: result.resource?.[4] ?? 'json',
          title: result.title,
        });
      }
      return navigateResourceHandler(result);
    }
    if (resolvedAs === 'external') {
      return window.open(
        (results as TDELink)._self,
        '_blank',
        'noopener noreferrer'
      );
    }
    return dispatch({
      type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
      payload: {
        top,
        left,
        resolvedAs,
        error,
        results,
        open: true,
      },
    });
  };
};
