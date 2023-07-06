import { extractFieldName } from './../../../subapps/search/containers/FilterOptions';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { has, isArray, last } from 'lodash';
import { useDispatch } from 'react-redux';
import useResolvedLinkEditorPopover from '../../molecules/ResolvedLinkEditorPopover/useResolvedLinkEditorPopover';
import isValidUrl, {
  isExternalLink,
  isStorageLink,
  isUrlCurieFormat,
} from '../../../utils/validUrl';
import { fetchResourceByResolver } from '../../../subapps/admin/components/Settings/ResolversSubView';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import {
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../../utils';
import { TDELink, TDEResource } from '../../store/reducers/data-explorer';
import { UISettingsActionTypes } from '../../store/actions/ui-settings';

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

const isDownloadableLink = (resource: Resource) => {
  return Boolean(
    resource['@type'] === 'File' || resource['@type']?.includes('File')
  );
};
export const getNormalizedTypes = (types?: string | string[]) => {
  if (types) {
    if (isArray(types)) {
      return types.map(item => {
        if (isValidUrl(item)) {
          return item.split('/').pop()!;
        }
        return item;
      });
    }
    return [last(types.split('/'))!];
  }
  return [];
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
const NEAR_BY = [0, 0, 0, 5, 0, -5, 5, 0, -5, 0];
export function getTokenAndPosAt(e: MouseEvent, current: CodeMirror.Editor) {
  const node = e.target || e.srcElement;
  const text =
    (node as HTMLElement).innerText || (node as HTMLElement).textContent;

  for (let i = 0; i < NEAR_BY.length; i += 2) {
    const coords = {
      left: e.pageX + NEAR_BY[i],
      top: e.pageY + NEAR_BY[i + 1],
    };
    const pos = current.coordsChar({
      ...coords,
    });
    const token = current.getTokenAt(pos);
    if (token && token.string === text) {
      return {
        token,
        coords,
      };
    }
  }
  return {
    token: null,
    coords: { left: e.pageX, top: e.pageY },
  };
}
export async function editorLinkResolutionHandler({
  nexus,
  orgLabel,
  projectLabel,
  url,
}: {
  nexus: NexusClient;
  url: string;
  orgLabel: string;
  projectLabel: string;
}): Promise<TReturnedResolvedData> {
  let data;
  try {
    // case-1: link resolved by the project resolver
    data = await fetchResourceByResolver({
      nexus,
      orgLabel,
      projectLabel,
      resourceId: encodeURIComponent(url),
    });
    const entity = getOrgAndProjectFromResourceObject(data);
    const isDownloadable = isDownloadableLink(data);
    return {
      resolvedAs: 'resource',
      results: {
        isDownloadable,
        _self: data._self,
        title: getResourceLabel(data),
        types: getNormalizedTypes(data['@type']),
        resource: getDataExplorerResourceItemArray(
          entity ?? { orgLabel: '', projectLabel: '' },
          data
        ),
      },
    };
  } catch (error) {
    try {
      // case-2: link can not be resolved by the project resolver
      // then try to find it across all projects
      // it may be single resource, multiple resources or external resource
      // if no resource found then we consider it as an error
      data = await nexus.Resource.list(undefined, undefined, {
        locate: url,
      });
      if (
        !data._total ||
        (!data._total && url.startsWith('https://bbp.epfl.ch'))
      ) {
        throw new Error('Resource can not be resolved');
      }
      if (data._total === 1) {
        const result = data._results[0];
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
      return {
        resolvedAs: 'resources',
        results: data._results.map(item => {
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
    } catch (error) {
      // case-3: if an error occured when tring both resolution method above
      // we check if the resource is external
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
      // case-4: if not an external url then it will be an error
      return {
        error: has(error, 'details')
          ? (error as TDeltaError).details
          : (error as TErrorMessage).message ?? JSON.stringify(error),
        resolvedAs: 'error',
      };
    }
  }
}

export const useResourceResoultion = () => {
  const dispatch = useDispatch();
  const { navigateResourceHandler } = useResolvedLinkEditorPopover();
  return ({
    resolvedAs,
    error,
    results,
    top,
    left,
  }: TEditorPopoverResolvedData) => {
    if (resolvedAs === 'resource' && !(results as TDELink).isDownloadable) {
      return navigateResourceHandler({ ...(results as TDELink) });
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
        resolvedAs,
        error,
        results,
        top,
        left,
        open: true,
      },
    });
  };
};
