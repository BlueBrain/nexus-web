import { ElasticSearchView } from '@bbp/nexus-sdk';
import * as React from 'react';
import { ResultTableFields } from '../../../../shared/types/search';
declare const DashboardElasticSearchQueryContainer: React.FC<{
  fields?: ResultTableFields[];
  view: ElasticSearchView;
  dataQuery: string;
  goToStudioResource: (selfUrl: string) => void;
}>;
export default DashboardElasticSearchQueryContainer;
