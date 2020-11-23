import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Spin, Alert, message, Button, notification } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import {
  SelectQueryResponse,
  SparqlViewQueryResponse,
  Resource,
} from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { omit } from 'lodash';

import ResultsTable from '../../../shared/components/ResultsTable/ResultsTable';
import { camelCaseToLabelString, parseProjectUrl } from '../../../shared/utils';
import { download } from '../../../shared/utils/download';

export type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};

type Item = {
  id: string;
  self: string;
  key: string;
  [key: string]: any;
};

type NexusSparqlError = {
  reason: string;
};

const DashboardResultsContainer: React.FunctionComponent<{
  dataQuery: string;
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  dashboardLabel: string;
}> = ({ orgLabel, projectLabel, dataQuery, viewId, dashboardLabel }) => {
  const [error, setError] = React.useState<NexusSparqlError | Error>();
  const [items, setItems] = React.useState<any[]>();
  const [headerProperties, setHeaderProperties] = React.useState<any[]>();
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();

  const goToStudioResource = (selfUrl: string) => {
    nexus
      .httpGet({
        path: selfUrl,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        history.push(
          `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            resource['@id']
          )}`,
          { background: location }
        );
      })
      .catch(error => {
        message.error(`Resource ${self} could not be found`);
      });
  };

  React.useEffect(() => {
    if (error) {
      setError(undefined);
    }

    nexus.View.sparqlQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      dataQuery
    )
      .then((result: SparqlViewQueryResponse) => {
        const data: SelectQueryResponse = result as SelectQueryResponse;
        const tempHeaderProperties: {
          title: string;
          dataIndex: string;
        }[] = data.head.vars
          .filter(
            // we don't want to display total or self url in result table
            (headVar: string) => !(headVar === 'total' || headVar === 'self')
          )
          .map((headVar: string) => ({
            title: camelCaseToLabelString(headVar), // TODO: get the matching title from somewhere?
            dataIndex: headVar,
          }));
        setHeaderProperties(tempHeaderProperties);
        // build items
        const tempItems = data.results.bindings
          // we only want resources
          .filter((binding: Binding) => binding.self)
          .map((binding: Binding, index: number) => {
            // let's get the value for each headerProperties
            const properties = tempHeaderProperties.reduce(
              (prev, curr) => ({
                ...prev,
                [curr.dataIndex]:
                  (binding[curr.dataIndex] && binding[curr.dataIndex].value) ||
                  undefined,
              }),
              {}
            );
            // return item data

            return {
              ...properties, // our properties
              id: index.toString(), // id is used by antd component
              self: binding.self, // used in order to load details or resource once selected
              key: index.toString(), // used by react component (unique key)
            };
          });
        setItems(tempItems);
      })
      .catch(e => {
        setError(e);
      });
  }, [dataQuery, viewId]);

  const onClickDownload = () => {
    if (items) {
      const itemsToSave = items.map(item => omit(item, 'id', 'key', 'self'));
      const fieldValue = (key: string, value: string) =>
        value === null ? '' : value;
      const header = Object.keys(itemsToSave[0]);

      const csv = items.map(row =>
        header
          .map(fieldName => JSON.stringify(row[fieldName], fieldValue))
          .join(',')
      );

      csv.unshift(header.join(','));

      const csvOutput = csv.join('\r\n');

      download(`${dashboardLabel}.csv`, 'text/csv', csvOutput);

      notification.success({
        message: 'Tabled is saved successfully',
        duration: 5,
      });
    }
  };

  if (error) {
    return (
      <Alert
        message="Error loading dashboard"
        description={`Something went wrong. ${(error as NexusSparqlError)
          .reason || (error as Error).message}`}
        type="error"
      />
    );
  }

  return (
    <Spin spinning={items ? false : true}>
      <ResultsTable
        headerProperties={headerProperties}
        items={items ? (items as Item[]) : []}
        handleClick={goToStudioResource}
        download={onClickDownload}
      />
    </Spin>
  );
};

export default DashboardResultsContainer;
