import * as React from 'react';
import { NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import InfiniteSearch from '../List/InfiniteSearch';
import { makeDatasetQuery } from './makeDatasetQuery';
import { Binding } from './FacetList';

const makeDatasetFromSparlQueryResponse = (response: any) => {
  return response.results.bindings.reduce(
    (prev: { items: any[]; total: number }, binding: Binding) => {
      const [key] = Object.keys(binding);
      if (key === 'total') {
        prev.total = Number(binding[key].value);
      } else if (!binding[key]) {
        return prev;
      } else {
        const self = binding[key].value;
        if (self) {
          prev.items.push(self);
        }
      }
      return prev;
    },
    {
      items: [],
      total: 0,
    }
  );
};

const DEFAULT_PAGE_SIZE = 20;

const DatasetList: React.FunctionComponent<{
  datasetQueryConfig: {
    vocab: string;
    graphs: { [filterName: string]: string };
  };
  children: any;
  defaultSearchValue?: string;
  height?: number;
  aggViewSelfID: string;
  appliedFacets?: { [filterName: string]: string[] };
}> = props => {
  const nexus: NexusClient = useNexusContext();
  const [datasets, setDatasets] = React.useState<any>({
    total: 0,
    searchValue: props.defaultSearchValue,
    items: [],
  });

  // initial load
  React.useEffect(() => {
    nexus
      .httpPost({
        body: makeDatasetQuery(
          props.datasetQueryConfig,
          props.appliedFacets || {},
          DEFAULT_PAGE_SIZE,
          0
        ),
        path: `${props.aggViewSelfID}/sparql`,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then(res => {
        setDatasets(makeDatasetFromSparlQueryResponse(res));
      });
  }, [props.appliedFacets && JSON.stringify(props.appliedFacets)]);

  const loadMore = ({ searchValue }: { searchValue: string }) => {
    // if filters have changed, we need to reset:
    // - the entire list back to []
    // - the from index back to 0
    const newFilter: boolean = searchValue !== datasets.searchValue;
    nexus
      .httpPost({
        body: makeDatasetQuery(
          props.datasetQueryConfig,
          props.appliedFacets || {},
          DEFAULT_PAGE_SIZE,
          0
        ),
        path: `${props.aggViewSelfID}/sparql`,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then(res => {
        const parsedResponse = makeDatasetFromSparlQueryResponse(res);
        setDatasets({
          ...parsedResponse,
          items: newFilter
            ? parsedResponse.items
            : [...datasets.items, ...parsedResponse.items],
        });
      });
  };
  return (
    <InfiniteSearch
      onLoadMore={loadMore}
      hasMore={datasets.items.length < datasets.total}
      defaultSearchValue={props.defaultSearchValue}
      height={props.height}
    >
      {props.children && props.children({ items: datasets.items })}
    </InfiniteSearch>
  );
};

export default DatasetList;
