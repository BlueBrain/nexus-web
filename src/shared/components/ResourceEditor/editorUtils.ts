import { extractFieldName } from './../../../subapps/search/containers/FilterOptions';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { Dispatch } from 'redux';
import { has, isArray, last } from 'lodash';
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
import { TDEResource } from '../../store/reducers/data-explorer';
import {
  UISettingsActionTypes,
  TUpdateJSONEditorPopoverAction,
} from '../../store/actions/ui-settings';

export type TToken = {
  string: string;
  start: number;
  end: number;
};
type TActionData = {
  type: typeof UISettingsActionTypes['UPDATE_JSON_EDITOR_POPOVER'];
  payload: TEditorPopoverResolvedData;
};

type TDeltaError = Error & {
  '@type': string;
  details: string;
};
type TErrorMessage = Error & {
  message: string;
};
const dispatchEvent = (
  dispatch: Dispatch<TUpdateJSONEditorPopoverAction>,
  data: TActionData
) => {
  return dispatch<{
    type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER;
    payload: TEditorPopoverResolvedData;
  }>({
    type: data.type,
    payload: data.payload,
  });
};

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

const mayBeResolvableLink = (url: string): boolean => {
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
export async function resolveLinkInEditor({
  nexus,
  dispatch,
  orgLabel,
  projectLabel,
  url,
  defaultPaylaod,
}: {
  nexus: NexusClient;
  dispatch: Dispatch<TUpdateJSONEditorPopoverAction>;
  url: string;
  orgLabel: string;
  projectLabel: string;
  defaultPaylaod: { top: number; left: number; open: boolean };
}) {
  if (mayBeResolvableLink(url)) {
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
      return dispatchEvent(dispatch, {
        type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
        payload: {
          ...defaultPaylaod,
          error: null,
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
        },
      });
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
        return dispatchEvent(dispatch, {
          type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
          payload: {
            ...defaultPaylaod,
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
          },
        });
      } catch (error) {
        // case-3: if an error occured when tring both resolution method above
        // we check if the resource is external
        if (isExternalLink(url)) {
          return dispatchEvent(dispatch, {
            type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
            payload: {
              ...defaultPaylaod,
              resolvedAs: 'external',
              results: {
                _self: url,
                title: url,
                types: [],
              },
            },
          });
        }
        // case-4: if not an external url then it will be an error
        return dispatchEvent(dispatch, {
          type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
          payload: {
            ...defaultPaylaod,
            error: has(error, 'details')
              ? (error as TDeltaError).details
              : (error as TErrorMessage).message ?? JSON.stringify(error),
            resolvedAs: 'error',
          },
        });
      }
    }
  }
  return null;
}
