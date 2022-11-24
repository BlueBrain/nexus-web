import * as React from 'react';
import { SubApp } from '..';
export declare const StudioLegacySubappContext: React.Context<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
}>;
export declare function useStudioLegacySubappContext(): {
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
};
export declare const StudioLegacySubappProviderHOC: (
  component: React.FunctionComponent
) => () => JSX.Element;
declare const StudioLegacy: SubApp;
export default StudioLegacy;
