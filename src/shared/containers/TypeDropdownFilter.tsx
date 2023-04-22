import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID, NexusClient } from '@bbp/nexus-sdk';

import DropdownFilter from '../components/DropdownFilter';
import { TypeDropdownItem } from '../components/DropdownFilter/DropdownItem';
import { useQuery } from 'react-query';

// must be explicitly set for elasticSearch, default is 10
const RESULTS_SIZE = 10000;

const fetchESVTypes = ({
  nexus,
  orgLabel,
  projectLabel,
  deprecated,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  deprecated: boolean;
}) =>
  nexus.View.elasticSearchQuery(
    orgLabel,
    projectLabel,
    encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
    {
      aggregations: {
        types: {
          filter: {
            term: { _deprecated: deprecated },
          },
          aggregations: {
            filteredByDeprecation: {
              terms: {
                field: '@type',
                size: RESULTS_SIZE,
              },
            },
          },
        },
      },
    }
  );
const TypeDropdownFilterContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  deprecated: boolean;
  value?: string;
  onChange(value: string): void;
}> = ({ orgLabel, projectLabel, onChange, deprecated, value }) => {
  const nexus = useNexusContext();

  const { data } = useQuery({
    queryKey: [
      'resource-list-query-types',
      {
        deprecated,
        orgLabel,
        projectLabel,
        desv_id: DEFAULT_ELASTIC_SEARCH_VIEW_ID,
      },
    ],
    queryFn: () => fetchESVTypes({ nexus, orgLabel, projectLabel, deprecated }),
    refetchOnWindowFocus: true,
  });
  const buckets = (data &&
    data.aggregations.types.filteredByDeprecation.buckets.map(
      ({ doc_count, key }: { doc_count: number; key: string }) => ({
        key,
        count: doc_count,
      })
    )) ||
    []
  return (
    <DropdownFilter
      buckets={buckets}
      defaultSelected={value}
      onChange={onChange}
      placeholder={'Filter by Type'}
      dropdownItem={TypeDropdownItem}
    />
  );
};

export default TypeDropdownFilterContainer;
