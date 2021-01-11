import { ElasticSearchView } from '@bbp/nexus-sdk';
import * as React from 'react';

const DashboardElasticSearchQueryContainer: React.FC<{
  view: ElasticSearchView;
  dataQuery: string;
  dashboardLabel: string;
  goToStudioResource: (selfUrl: string) => void;
}> = ({ view, dataQuery, dashboardLabel, goToStudioResource }) => {
  return <>"banana"</>;
};

export default DashboardElasticSearchQueryContainer;
