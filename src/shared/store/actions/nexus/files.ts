import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from '../..';
import { NexusFile } from '@bbp/nexus-sdk';
import { RootState } from '../../reducers';
import { CreateFileOptions } from '@bbp/nexus-sdk/lib/File/types';

export const createFile: ActionCreator<ThunkAction> = (
  file: File,
  options?: CreateFileOptions
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<NexusFile | null> => {
    const NexusFile = nexus.NexusFile;
    const nexusState = (getState() as RootState).nexus;
    if (
      nexusState &&
      nexusState.activeProject &&
      nexusState.activeProject.data
    ) {
      return await NexusFile.createFile(
        nexusState.activeProject.data.orgLabel,
        nexusState.activeProject.data.label,
        file,
        options
      );
    }
    return null;
  };
};
