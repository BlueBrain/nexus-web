import * as React from 'react';
import { SubApp } from '..';
export declare const AdminSubappContext: React.Context<{
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
}>;
export declare function useAdminSubappContext(): {
  title: string;
  namespace: string;
  icon: string;
  requireLogin: boolean;
  description: string;
};
export declare const AdminSubappProviderHOC: (
  component: React.FunctionComponent
) => () => JSX.Element;
declare const Admin: SubApp;
export default Admin;
