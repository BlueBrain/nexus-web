import { NexusClient } from '@bbp/nexus-sdk';
import { Alert, Collapse, List } from 'antd';
import React from 'react';
import ReactJson from 'react-json-view';
import './styles.scss';

interface Props {
  indexingErrors: IndexingErrorResults;
}

export const ViewIndexingErrors: React.FC<Props> = ({
  indexingErrors,
}: Props) => {
  return (
    <div>
      {<h3>{indexingErrors._total} Total errors</h3>}
      {indexingErrors._total && (
        <Alert
          message="The list below shows all indexing errors - even the ones that are now resolved."
          showIcon
          style={{ margin: '20px' }}
        />
      )}
      <List
        itemLayout="horizontal"
        dataSource={indexingErrors?._results}
        data-testid="indexing-error-list"
        renderItem={(indexingError: IndexingError) => (
          <Collapse>
            <Collapse.Panel
              header={indexingError.message}
              key={indexingError.id}
              className="indexing-error-header"
            >
              <ReactJson src={indexingError} />
            </Collapse.Panel>
          </Collapse>
        )}
      />
    </div>
  );
};

export const fetchIndexingErrors = async ({
  nexus,
  apiEndpoint,
  orgLabel,
  projectLabel,
  viewId,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
}): Promise<IndexingErrorResults> => {
  const indexingErrors = await nexus.httpGet({
    path: `${apiEndpoint}/views/${orgLabel}/${projectLabel}/${encodeURIComponent(
      viewId
    )}/failures`,
    headers: { Accept: 'application/json' },
  });
  return indexingErrors;
};

export interface IndexingErrorResults {
  '@context': string[] | string;
  _next: string;
  _results: IndexingError[];
  _total: number;
}

interface IndexingError {
  id: string;
  message: string;
  errorType: string;
}
