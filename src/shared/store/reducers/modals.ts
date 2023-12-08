import { AnyAction } from 'redux';

import {
  ModalsActionsEnum,
  updateOrganizationModalVisibility,
  updateProjectModalVisibility,
} from '../actions/modals';

export const DEFAULT_MODALS_STATE = {
  isCreateOrganizationModelVisible: false,
  isCreateProjectModelVisible: false,
  isCreateStudioModelVisible: false,
  isAboutModelVisible: false,
};
export type modalsState = {
  isCreateOrganizationModelVisible: boolean;
  isCreateProjectModelVisible: boolean;
  isCreateStudioModelVisible: boolean;
  isAboutModelVisible: boolean;
};

export default function modalsReducer(
  state: modalsState = DEFAULT_MODALS_STATE,
  action: AnyAction
) {
  switch (action.type) {
    case ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL: {
      return {
        ...state,
        isCreateProjectModelVisible: action.payload ?? !state.isCreateProjectModelVisible,
      };
    }
    case ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL: {
      return {
        ...state,
        isCreateOrganizationModelVisible: action.payload ?? !state.isCreateOrganizationModelVisible,
      };
    }
    case ModalsActionsEnum.OPEN_STUDIO_CREATION_MODEL: {
      return {
        ...state,
        isCreateStudioModelVisible: action.payload ?? !state.isCreateStudioModelVisible,
      };
    }
    case ModalsActionsEnum.OPEN_ABOUT_MODAL: {
      return {
        ...state,
        isAboutModelVisible: action.payload ?? !state.isAboutModelVisible,
      };
    }
  }
  return state;
}
