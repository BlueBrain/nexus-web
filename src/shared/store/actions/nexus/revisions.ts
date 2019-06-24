import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from '../..';
import { Resource } from '@bbp/nexus-sdk-legacy';
import { RootState } from '../../reducers';

export type Revisions = any[];

export const listRevisions: ActionCreator<ThunkAction> = (
  resource: Resource
) => {
  return async (dispatch: Dispatch<any>, getState): Promise<Revisions> => {
    // SDK doesn't provide this functionality so I'll quickly
    // just boot it with fetch

    const { apiEndpoint } = (getState() as RootState).config;
    const { user } = (getState() as RootState).oidc;

    // This creates an array like [0,1,2,3]
    // so if you have 4 revisions
    // it will be [0,1,2,3]
    const promises = [...Array(resource.rev).keys()]
      // map to promises
      .map((index: number) => {
        const url = `${apiEndpoint}/resources/${resource.orgLabel}/${
          resource.projectLabel
        }/_/${encodeURIComponent(resource.id)}?rev=${index + 1}`;
        return fetch(url, {
          headers: user
            ? {
                authorization: `bearer ${user.access_token}`,
              }
            : {},
        });
      });
    const responses = await Promise.all(promises);
    return await Promise.all(responses.map(response => response.json()));
  };
};
