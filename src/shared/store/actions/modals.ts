import { ActionCreator } from 'redux';

export enum ModalsActionsEnum {
  OPEN_PROJECT_CREATION_MODAL = 'OPEN_PROJECT_CREATION_MODAL',
  OPEN_ORGANIZATION_CREATION_MODAL = 'OPEN_ORGANIZATION_CREATION_MODAL',
}

const updateProjectModalVisibility = (payload: boolean) => ({
  payload,
  type: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
});
const updateOrganizationModalVisibility = (payload: boolean) => ({
  payload,
  type: ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL,
});

export { updateProjectModalVisibility, updateOrganizationModalVisibility };
