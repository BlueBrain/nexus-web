import { NexusClient } from '@bbp/nexus-sdk';
import { Dispatch } from 'redux';
import { isArray, last } from 'lodash';
import isValidUrl, { externalLink } from '../../../utils/validUrl';
import { fetchResourceByResolver } from '../../../subapps/admin/components/Settings/ResolversSubView';
import { TEditorPopoverResolvedData } from '../../store/reducers/ui-settings';
import {
  getOrgAndProjectFromResourceObject,
  getResourceLabel,
} from '../../utils';
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
  if (isValidUrl(url)) {
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
      return dispatchEvent(dispatch, {
        type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
        payload: {
          ...defaultPaylaod,
          error: null,
          resolvedAs: 'resource',
          results: {
            _self: data._self,
            title: getResourceLabel(data),
            types: getNormalizedTypes(data['@type']),
            resource: [
              entity?.orgLabel,
              entity?.projectLabel,
              data['@id'],
              data._rev,
            ],
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
        return dispatchEvent(dispatch, {
          type: UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
          payload: {
            ...defaultPaylaod,
            ...(externalLink(url) && !data._total
              ? {
                  resolvedAs: 'external',
                  results: {
                    _self: url,
                    title: url,
                    types: [],
                  },
                }
              : !data._total
              ? {
                  error: 'No @id or _self has been resolved',
                  resolvedAs: 'error',
                }
              : {
                  resolvedAs: 'resources',
                  results: data._results.map(item => {
                    const entity = getOrgAndProjectFromResourceObject(item);
                    return {
                      _self: item._self,
                      title: getResourceLabel(item),
                      types: getNormalizedTypes(item['@type']),
                      resource: [
                        entity?.orgLabel,
                        entity?.projectLabel,
                        item['@id'],
                        item._rev,
                      ],
                    };
                  }),
                }),
          },
        });
      } catch (error) {
        console.error('case 3: ', url, externalLink(url), '\n', error);
        // case-3: if an error occured when tring both resolution method above
        // we check if the resource is external
        if (externalLink(url)) {
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
            error: JSON.stringify(error),
            resolvedAs: 'error',
          },
        });
      }
    }
  }
  return null;
}
