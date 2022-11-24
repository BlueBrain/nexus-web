import * as React from 'react';
import { View } from '@bbp/nexus-sdk';
export declare type DashboardPayload = {
  description?: string;
  label?: string;
  dataQuery: string;
  plugins?: string[];
};
export declare type DashboardConfigEditorProps = {
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
  view?: View;
  linkToSparqlQueryEditor?(dataQuery: string): React.ReactElement;
  availablePlugins?: string[];
};
declare const DashboardConfigEditorComponent: React.FunctionComponent<DashboardConfigEditorProps>;
export default DashboardConfigEditorComponent;
