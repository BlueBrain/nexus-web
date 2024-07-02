import * as React from 'react';
import { SparqlView } from '@bbp/nexus-sdk';
import { Alert, Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import SparqlResultsTable, {
  ResultTableProps,
} from '../../../../shared/components/SparqlResultsTable';
import useAsyncCall from '../../../../shared/hooks/useAsynCall';
import { querySparqlView } from '../../../../shared/utils/querySparqlView';

export type NexusSparqlError = {
  reason: string;
};

const DashboardSparqlQueryContainer: React.FC<{
  view: SparqlView;
  dataQuery: string;
  dashboardLabel: string;
  goToStudioResource: (selfUrl: string) => void;
}> = ({ view, dataQuery, dashboardLabel, goToStudioResource }) => {
  const nexus = useNexusContext();
  console.log('@@dashboardLabel', dashboardLabel)
  const queryResult = useAsyncCall<
    {
      headerProperties: ResultTableProps['headerProperties'];
      items: ResultTableProps['items'];
    },
    Error | NexusSparqlError
  >(
    querySparqlView({
      nexus,
      view,
      dataQuery,
    })(),
    [dataQuery, view]
  );

  return (
    <Spin spinning={queryResult.loading} wrapperClassName="dashboard-spinner">
      {queryResult.error && (
        <Alert
          message="Error loading dashboard"
          description={`Something went wrong. ${(queryResult.error as NexusSparqlError)
            .reason || (queryResult.error as Error).message}`}
          type="error"
        />
      )}
      {queryResult.data && (
        <SparqlResultsTable
          headerProperties={queryResult.data?.headerProperties}
          items={queryResult.data?.items || []}
          handleClick={goToStudioResource}
          tableLabel={dashboardLabel}
        />
      )}
    </Spin>
  );
};

export default DashboardSparqlQueryContainer;
