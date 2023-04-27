import {
  ModalsActionsEnum,
  updateProjectModalVisibility,
  updateOrganizationModalVisibility,
} from '../actions/modals';
import { AnyAction } from 'redux';

export const DEFAULT_MODALS_STATE = {
  createOrganizationModel: false,
  createProjectModel: false,
  createStudioModel: false,
  aboutModel: false,
};
export type modalsState = {
  createOrganizationModel: boolean;
  createProjectModel: boolean;
  createStudioModel: boolean;
  aboutModel: boolean;
};

export default function modalsReducer(
  state: modalsState = DEFAULT_MODALS_STATE,
  action: AnyAction
) {
  switch (action.type) {
    case ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL: {
      return {
        ...state,
        createProjectModel: action.payload ?? !state.createProjectModel,
      };
    }
    case ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL: {
      return {
        ...state,
        createOrganizationModel:
          action.payload ?? !state.createOrganizationModel,
      };
    }
    case ModalsActionsEnum.OPEN_STUDIO_CREATION_MODEL: {
      return {
        ...state,
        createStudioModel: action.payload ?? !state.createStudioModel,
      };
    }
    case ModalsActionsEnum.OPEN_ABOUT_MODAL: {
      return {
        ...state,
        aboutModel: action.payload ?? !state.aboutModel,
      };
    }
  }
  return state;
}
