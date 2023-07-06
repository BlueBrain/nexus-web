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
    // case: link resolved by the project resolver
    data = await fetchResourceByResolver({
      nexus,
      orgLabel,
      projectLabel,
      resourceId: encodeURIComponent(url),
    });
    const entity = getOrgAndProjectFromResourceObject(data);
    const isDownloadable = isDownloadableLink(data);
    // case-resource: link is resolved as a resource by project resolver
    // next-action: open resource editor
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
      // cases: using nexus search api to resolve the link
      data = await nexus.Resource.list(undefined, undefined, {
        locate: url,
      });
      if (!data._total || (!data._total && isExternalLink(url))) {
        // case-error: link is not resolved by nither project resolver nor nexus search api
        // next-action: throw error and capture it in the catch block
        throw new Error('Resource can not be resolved');
      } else if (data._total === 1) {
        // case-resource: link is resolved as a resource by nexus search api
        // next-action: open resource editor
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
      } else {
        // case-resources: link is resolved as a list of resources by nexus search api
        // next-action: open resources list in the popover
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
      }
    } catch (error) {
      // case-external: link is external
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
