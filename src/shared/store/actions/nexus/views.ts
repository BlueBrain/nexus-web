import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from '../..';
import { Resource } from '@bbp/nexus-sdk-legacy';

export const listViews: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<Resource[]> => {
    const Project = nexus.Project;
    const Resource = nexus.Resource;
    const realProject = await Project.get(orgLabel, projectLabel);
    const views = await realProject.listViews();
    // Getting lists as projects because View classes for this SDK
    // doesn't offer the convenience methods that a Resource has
    const promises = views.map(view =>
      Resource.get(
        view.orgLabel,
        view.projectLabel,
        '_',
        encodeURIComponent(view.id)
      )
    );
    return await Promise.all(promises);
  };
};
