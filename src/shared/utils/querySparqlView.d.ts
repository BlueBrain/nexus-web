import { NexusClient, SparqlView } from '@bbp/nexus-sdk';
export declare type Binding = {
  [key: string]: {
    dataType?: string;
    type: string;
    value: string;
  };
};
export interface QuerySparqlViewProps {
  nexus: NexusClient;
  dataQuery: string;
  view: SparqlView;
}
export declare const sparqlQueryExecutor: (
  nexus: NexusClient,
  dataQuery: string,
  view: SparqlView,
  hasProjection: boolean,
  projectionId?: string | undefined
) => Promise<{
  headerProperties: {
    title: string;
    dataIndex: string;
  }[];
  items: {
    id: string;
    self: {
      dataType?: string | undefined;
      type: string;
      value: string;
    };
    key: string;
  }[];
}>;
export declare const querySparqlView: ({
  nexus,
  dataQuery,
  view,
}: QuerySparqlViewProps) => () => Promise<{
  headerProperties: {
    title: string;
    dataIndex: string;
  }[];
  items: {
    id: string;
    self: {
      dataType?: string | undefined;
      type: string;
      value: string;
    };
    key: string;
  }[];
}>;
