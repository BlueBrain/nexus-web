import * as React from 'react';
import { Spin, Alert, Button } from 'antd';
import ResultsTable from '../components/ResultsTable/ResultsTable';
import { camelCaseToLabelString } from '../utils';
import {
  Resource,
  SelectQueryResponse,
  SparqlViewQueryResponse,
} from '@bbp/nexus-sdk';
import ResourceCardComponent from '../components/ResourceCard';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusPlugin } from './NexusPlugin';
import useQueryString from '../hooks/useQueryString';

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
  studioResourceId: string;
  plugins?: string[];
}> = ({
  orgLabel,
  projectLabel,
  dataQuery,
  viewId,
  studioResourceId,
  plugins = [],
}) => {
  const [queryParams, setQueryString] = useQueryString();
  const { resourceId } = queryParams;
  const [selectedResource, setSelectedResource] = React.useState<Resource>();
  const [error, setError] = React.useState<NexusSparqlError | Error>();
  const [items, setItems] = React.useState<any[]>();
  const [headerProperties, setHeaderProperties] = React.useState<any[]>();
  const nexus = useNexusContext();
  const selectResource = (selfUrl: string, setHistory = true) => {
    if (error) {
      setError(undefined);
    }

    nexus
      .httpGet({ path: selfUrl })
      .then(res => {
        setSelectedResource(res);
        if (setHistory) {
          updateResourcePath(res);
        }
      })
      .catch(e => {
        setError(e);
        // TODO: show a meaningful error to the user.
      });
  };

  const updateResourcePath = (resource: Resource) => {
    setQueryString({
      ...queryParams,
      workspaceId: resource['@id'],
    });
  };

  const unSelectResource = () => {
    setSelectedResource(undefined);
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

        const currentResource = data.results.bindings
          .filter((binding: Binding) => binding.self)
          .find((binding: Binding) => {
            return binding.self.value.includes(studioResourceId);
          });
        if (selectedResource === undefined && currentResource !== undefined) {
          selectResource(currentResource.self.value, false);
        }
        setItems(tempItems);
      })
      .catch(e => {
        setError(e);
      });
  }, [orgLabel, projectLabel, dataQuery, viewId]);

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
    <Spin spinning={selectedResource || items ? false : true}>
      {selectedResource ? (
        <div className="studio-resource">
          <Button
            type="primary"
            size="small"
            className={'studio-back-button'}
            icon="caret-left"
            onClick={unSelectResource}
          >
            {' '}
            Back{' '}
          </Button>
          <ResourceCardComponent
            resource={selectedResource}
            preview={plugins.map(pluginName => (
              <div style={{ margin: '1em' }}>
                <NexusPlugin
                  url={`/public/plugins/${pluginName}/index.js`}
                  nexusClient={nexus}
                  resource={selectedResource}
                />
              </div>
            ))}
          />
        </div>
      ) : (
        <ResultsTable
          headerProperties={headerProperties}
          items={items ? (items as Item[]) : []}
          handleClick={selectResource}
        />
      )}
    </Spin>
  );
};

export default DashboardResultsContainer;
