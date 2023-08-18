import * as React from 'react';
import { useNexus } from '@bbp/react-nexus';
import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk/es';

import DropdownFilter from '../components/DropdownFilter';

// must be explicitly set for elasticSearch, default is 10
const RESULTS_SIZE = 10000;

const SchemaDropdownFilterContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  deprecated: boolean;
  onChange(value: string): void;
  value?: string;
}> = ({ orgLabel, projectLabel, onChange, deprecated, value }) => {
  const { loading: busy, data, error } = useNexus<
    ElasticSearchViewQueryResponse<any>
  >(nexus =>
    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(DEFAULT_ELASTIC_SEARCH_VIEW_ID),
      {
        aggregations: {
          schemas: {
            filter: {
              term: { _deprecated: deprecated },
            },
            aggregations: {
              filteredByDeprecation: {
                terms: {
                  field: '_constrainedBy',
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
          data.aggregations.schemas.filteredByDeprecation.buckets.map(
            ({ doc_count, key }: { doc_count: number; key: string }) => ({
              key,
              count: doc_count,
            })
          )) ||
        []
      }
      defaultSelected={value}
      onChange={onChange}
      placeholder={'Filter by Schema'}
    />
  );
};

export default SchemaDropdownFilterContainer;
