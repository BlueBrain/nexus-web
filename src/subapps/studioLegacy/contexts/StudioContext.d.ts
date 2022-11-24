import * as React from 'react';
export declare type StudioContextType = {
  orgLabel: string;
  projectLabel: string;
  studioId: string;
  isWritable: boolean;
  workspaceId?: string | undefined;
  dashboardId?: string | undefined;
};
declare const StudioReactContext: React.Context<StudioContextType>;
export default StudioReactContext;
