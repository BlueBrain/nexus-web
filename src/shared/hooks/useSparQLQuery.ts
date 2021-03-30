import { NexusClient, SparqlView, Resource, View } from '@bbp/nexus-sdk';
import * as React from 'react';
import useAsyncCall from './useAsynCall';
import { sparqlQueryExecutor } from '../utils/querySparqlView';

type HeaderProperties = {
  title: string;
  dataIndex: string;
}[];
type NexusSparqlError = {
  reason: string;
};
type Items = {
  id: string;
  [dataIndex: string]: any;
}[];
export const useSparQLQuery = (
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string
) => {
  const [x, setX] = React.useState<{
    headerProperties: HeaderProperties;
    items: Items;
  }>();
  React.useEffect(() => {
    const i = accessData();
    i.then(x => {
      setX(x);
    });
  }, [tableResourceId]);
  const accessData = async () => {
    const tableResource = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      tableResourceId
    )) as Resource;

    const view: SparqlView = (await nexus.View.get(
      orgLabel,
      projectLabel,
      tableResource.view
    )) as SparqlView;

    const dataQuery: string = tableResource.dataQuery;
    const m = await sparqlQueryExecutor(nexus, dataQuery, view);
    const headerProperties = m.headerProperties;
    const items = m.items;

    return { headerProperties, items };
  };
  return x;
};
