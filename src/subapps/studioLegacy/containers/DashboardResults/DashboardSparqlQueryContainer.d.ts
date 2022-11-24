import * as React from 'react';
import { SparqlView } from '@bbp/nexus-sdk';
export declare type NexusSparqlError = {
  reason: string;
};
declare const DashboardSparqlQueryContainer: React.FC<{
  view: SparqlView;
  dataQuery: string;
  dashboardLabel: string;
  goToStudioResource: (selfUrl: string) => void;
}>;
export default DashboardSparqlQueryContainer;
