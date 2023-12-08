import './view-form.scss';

import {
  AskQueryResponse,
  SelectQueryResponse,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk/es';
import { Card, Table, Tooltip } from 'antd';
import Column from 'antd/lib/table/Column';
import hash from 'object-hash';

import { ErrorComponent } from '../../../../shared/components/ErrorComponent';
import useNotification from '../../../../shared/hooks/useNotification';
import { matchResultUrls } from '../../../../shared/utils';
import { TError } from '../../../../utils/types';

export type NexusSparqlError =
  | string
  | {
      reason: string;
      details: string;
    };

export type Entry = {
  [key: string]: string;
  datatype: string;
  value: string;
  type: string;
};

const SparqlQueryResults: React.FunctionComponent<{
  response: SparqlViewQueryResponse | null;
  busy: boolean;
  error: NexusSparqlError | null;
}> = ({ response, busy, error }): JSX.Element => {
  // NOTE: if the query returns a simple boolean value (for example, ASK query)
  // then we have to make our own column header
  const columnHeaders: string[] =
    (response &&
      ((response as AskQueryResponse).boolean
        ? ['Result']
        : response.head && (response as SelectQueryResponse).head.vars)) ||
    [];

  const data: any[] =
    (response &&
      ((response as AskQueryResponse).boolean
        ? [(response as AskQueryResponse).boolean.toString()]
        : (response as SelectQueryResponse).results.bindings)) ||
    [];

  const notification = useNotification();

  const getUrl = (entry: string) => {
    try {
      return matchResultUrls(entry);
    } catch (error) {
      notification.error({
        message: `Could not parse ${entry}`,
        description: (error as TError).message,
      });
    }
    return entry;
  };
  return (
    <Card bordered className="results">
      {error &&
        (typeof error === 'string' ? (
          <ErrorComponent message={error} />
        ) : (
          <ErrorComponent message={error.reason} details={error.details} />
        ))}
      {!error && (
        <Table
          dataSource={data}
          pagination={{ position: ['topLeft', 'bottomRight'] }}
          rowKey={record => hash(record)}
          loading={busy}
        >
          {columnHeaders.map((columnHeader: string) => (
            <Column
              title={columnHeader}
              dataIndex={columnHeader}
              key={columnHeader}
              render={(entry: Entry) => {
                if (!entry) {
                  return <span className="empty">no value</span>;
                }

                // TODO: Improve sparql repsonse types visuall
                // https://github.com/BlueBrain/nexus/issues/756
                return (
                  <Tooltip title={entry.datatype}>
                    {entry.type === 'uri' ? (
                      <a href={getUrl(entry.value)}>&lt;{entry.value}&gt;</a>
                    ) : (
                      entry.value
                    )}
                  </Tooltip>
                );
              }}
            />
          ))}
        </Table>
      )}
    </Card>
  );
};

export default SparqlQueryResults;
