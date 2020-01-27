import * as React from 'react';
import { Card, Empty, Table, Tooltip, notification } from 'antd';
import Column from 'antd/lib/table/Column';
import * as hash from 'object-hash';
import { matchResultUrls } from '../../utils';
import {
  AskQueryResponse,
  SelectQueryResponse,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';

import './view-form.less';

export type NexusSparqlError =
  | string
  | {
      reason: string;
    };

export type Entry = {
  [key: string]: string;
  datatype: string;
  value: string;
  type: string;
};


const getUrl = (entry: string) => {
  try {
    return matchResultUrls(entry);
  } catch (error) {
    notification.error({
      message: `Could not parse ${entry}`,
      description: error.message,
    });
  }
  return entry;
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
      (!!(response as AskQueryResponse).boolean
        ? ['Result']
        : response.head && (response as SelectQueryResponse).head.vars)) ||
    [];

  const data: any[] =
    (response &&
      (!!(response as AskQueryResponse).boolean
        ? [(response as AskQueryResponse).boolean.toString()]
        : (response as SelectQueryResponse).results.bindings)) ||
    [];

  return (
    <Card bordered className="results">
      {error && (
        <Empty description={typeof error === 'string' ? error : error.reason} />
      )}
      {!error && (
        <Table
          dataSource={data}
          pagination={false}
          // TODO: maybe use index or something instead of hash
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
