import * as React from 'react';

export type StudioContextType = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  isWritable: boolean;
  workspaceId?: string | undefined;
  dashboardId?: string | undefined;
};

const StudioReactContext = React.createContext<StudioContextType>({
  orgLabel: '',
  projectLabel: '',
  studioId: '',
  isWritable: false,
});

export default StudioReactContext;
