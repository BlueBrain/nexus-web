import * as React from 'react';
import { ResultTableFields } from '../../../shared/types/search';
declare const DashboardResultsContainer: React.FunctionComponent<{
  dataQuery: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  fields?: ResultTableFields[];
  dashboardLabel: string;
}>;
export default DashboardResultsContainer;
