import * as React from 'react';
import { useNexus } from '@bbp/react-nexus';
import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk';
import DropdownFilter from '../components/DropdownFilter';

const SchemaDropdownFilterContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  onChange(value: string): void;
}> = ({ orgLabel, projectLabel, onChange }) => {
  const { loading: busy, data, error } = useNexus<
    ElasticSearchViewQueryResponse<any>
  >(nexus =>
    nexus.View.elasticSearchQuery(
      orgLabel,
      projectLabel,
      DEFAULT_ELASTIC_SEARCH_VIEW_ID,
      {
        aggregations: {
          schemas: {
            terms: {
              field: '_constrainedBy',
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
          data.aggregations.schemas.buckets.map(
            ({ doc_count, key }: { doc_count: number; key: string }) => ({
              key,
              count: doc_count,
            })
          )) ||
        []
      }
      onChange={onChange}
      placeholder={'Filter by Schema'}
    />
  );
};

export default SchemaDropdownFilterContainer;
