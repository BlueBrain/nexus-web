import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from '../..';
import { NexusFile } from '@bbp/nexus-sdk';
import { RootState } from '../../reducers';

export const createFile: ActionCreator<ThunkAction> = (file: File) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<NexusFile | null> => {
    const nexusState = (getState() as RootState).nexus;
    if (
      nexusState &&
      nexusState.activeProject &&
      nexusState.activeProject.data
    ) {
      return await NexusFile.create(
        nexusState.activeProject.data.orgLabel,
        nexusState.activeProject.data.label,
        file
      );
    }
    return null;
  };
};
