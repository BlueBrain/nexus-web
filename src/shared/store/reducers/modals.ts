import {
  ModalsActionsEnum,
  updateProjectModalVisibility,
  updateOrganizationModalVisibility,
} from '../actions/modals';
import { AnyAction } from 'redux';

export const DEFAULT_MODALS_STATE = {
  createOrganizationModel: false,
  createProjectModel: false,
};
export type modalsState = {
  createOrganizationModel: boolean;
  createProjectModel: boolean;
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
  }
  return state;
}
