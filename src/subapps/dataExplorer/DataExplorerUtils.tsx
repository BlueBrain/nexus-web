import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { useQuery } from 'react-query';

export const useAggregations = (
  bucketName: 'projects' | 'types',
  orgAndProject?: string[]
) => {
  const nexus = useNexusContext();
  return useQuery({
    queryKey: ['data-explorer-aggregations', orgAndProject],
    retry: false,
    queryFn: async () => {
      return await nexus.Resource.list(orgAndProject?.[0], orgAndProject?.[1], {
        aggregations: true,
      });
    },
    select: data => {
      return (
        ((data as unknown) as AggregationsResult).aggregations[bucketName]
          ?.buckets ?? ([] as AggregatedBucket[])
      );
    },
    onError: error => {
      notification.error({ message: 'Aggregations could not be fetched' });
    },
  });
};

export interface AggregationsResult {
  '@context': string;
  total: number;
  aggregations: {
    projects: AggregatedProperty;
    types: AggregatedProperty;
  };
}

export type AggregatedProperty = {
  buckets: AggregatedBucket[];
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
};

export type AggregatedBucket = { key: string; doc_count: number };
