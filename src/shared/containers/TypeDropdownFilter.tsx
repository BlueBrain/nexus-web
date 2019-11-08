import * as React from 'react';
import { useNexus } from '@bbp/react-nexus';
import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk';

import DropdownFilter from '../components/DropdownFilter';
import { TypeDropdownItem } from '../components/DropdownFilter/DropdownItem';

// must be explicitly set for elasticSearch, default is 10
const RESULTS_SIZE = 100;

const TypeDropdownFilterContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  deprecated: boolean;
  onChange(value: string): void;
}> = ({ orgLabel, projectLabel, onChange, deprecated }) => {
  const { loading: busy, data, error } = useNexus<
    ElasticSearchViewQueryResponse<any>
  >(nexus =>
    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      DEFAULT_ELASTIC_SEARCH_VIEW_ID,
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
    )
  );

  return (
    <DropdownFilter
      buckets={
        (data &&
          data.aggregations.types.filteredByDeprecation.buckets.map(
            ({ doc_count, key }: { doc_count: number; key: string }) => ({
              key,
              count: doc_count,
            })
          )) ||
        []
      }
      onChange={onChange}
      placeholder={'Filter by Type'}
      dropdownItem={TypeDropdownItem}
    />
  );
};

export default TypeDropdownFilterContainer;
