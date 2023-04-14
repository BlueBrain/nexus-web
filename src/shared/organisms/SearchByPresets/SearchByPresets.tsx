import React from 'react';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';
import { Alert, Spin } from 'antd';
import { orderBy, unionBy } from 'lodash';
import { match as pmatch } from 'ts-pattern';
import { PromisePool } from '@supercharge/promise-pool';

import {
  PresetCardItem,
  PresetCardItemSkeleton,
  PresetCardItemCompact,
} from '../../molecules';
import {
  SearchConfig,
  SearchLayout,
} from '../../../subapps/search/hooks/useGlobalSearch';
import './styles.less';

type TProps = {};
type TLayout = {
  id: string;
  name: string;
  stats?: string;
};
const ConfigQueryBuilder = (id: string) => {
  if (!id) {
    return {
      track_total_hits: true,
      size: 50,
      from: 0,
      query: {
        match_all: {},
      },
    };
  }
  return {
    from: 0,
    track_total_hits: true,
    sort: [
      {
        updatedAt: {
          order: 'desc',
        },
      },
    ],
    query: {
      bool: {
        filter: {
          bool: {
            filter: {
              term: {
                '@type.keyword': id,
              },
            },
          },
        },
        must: {
          match_all: {},
        },
      },
    },
  };
};
export const fetchNexusSearchConfig = async (nexus: NexusClient) => {
  try {
    const config: SearchConfig = await nexus.Search.config();
    const layouts: TLayout[] =
      config?.layouts.map(layout => ({
        id: layout.filters?.[0].values?.[0],
        name: layout.name,
      })) || [];
    const { results, errors } = await PromisePool.withConcurrency(4)
      .for(layouts)
      .process(async layout => {
        const result = await nexus.Search.query(ConfigQueryBuilder(layout.id));
        return {
          ...layout,
          stats: result.hits.total.value as string,
        };
      });
    return {
      errors,
      results: orderBy(results, i => Number(i.stats), ['desc']),
    };
  } catch (error) {
    console.log('@@error', error);
    // @ts-ignore
    throw new Error('Error found when fetching search configuration', {
      cause: error,
    });
  }
};

const SearchByPresets: React.FC<TProps> = ({}) => {
  const nexus = useNexusContext();
  const { data, status, error } = useQuery({
    queryKey: ['nexus-search-config-details'],
    queryFn: () => fetchNexusSearchConfig(nexus),
    keepPreviousData: true,
  });

  return (
    <div className="searchby-presets">
      <h2 className="searchby-presets-title">Search By</h2>
      {pmatch(status)
        .with('loading', () => (
          <Spin spinning={status === 'loading'}>
            <div className="searchby-presets-container">
              {Array(8)
                .fill('')
                .map((_, i) => (
                  <PresetCardItemSkeleton key={`preset-card-skeleton-${i}`} />
                ))}
            </div>
          </Spin>
        ))
        .with('error', () => (
          <Alert
            type="error"
            // @ts-ignore
            message={error.message}
            // @ts-ignore
            description={error.cause.message}
          />
        ))
        .with('success', () => (
          <div className="searchby-presets-container">
            {(data?.results as TLayout[]).map(layout => (
              <PresetCardItem
                key={`preset-card-${layout.id}`}
                title={layout.name}
                to={`/search?layout=${layout.name}`}
                stats={new Intl.NumberFormat('de-CH', {
                  maximumSignificantDigits: 3,
                }).format(Number(layout.stats))}
                label="Datasets"
              />
            ))}
          </div>
        ))
        .otherwise(() => (
          <></>
        ))}
    </div>
  );
};

export default SearchByPresets;

type SearchLayoutProps = {
  layouts?: SearchLayout[];
  selectedLayout?: string;
  onChangeLayout: (layout: string) => void;
};

export const SearchByPresetsCompact: React.FC<SearchLayoutProps> = ({
  layouts,
  selectedLayout,
  onChangeLayout,
}) => {
  return (
    <div className="searchby-presets compact">
      <div className="searchby-presets-container">
        {layouts?.map(item => (
          <PresetCardItemCompact
            key={`preset-card-compact-${item.name}`}
            title={item.name}
            selected={selectedLayout === item.name}
            onChangeLayout={onChangeLayout}
          />
        ))}
      </div>
    </div>
  );
};
