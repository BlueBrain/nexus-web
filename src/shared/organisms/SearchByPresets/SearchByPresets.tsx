import React from 'react';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';
import { Spin } from 'antd';
import { unionBy } from 'lodash';
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

type Props = {};
type TLayout = {
  id: string;
  name: string;
  stats?: string;
};
const ConfigQueryBuilder = (id: string) => {
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
export const fetchNexusSearchConfig = (
  nexus: NexusClient
): Promise<SearchConfig> => nexus.Search.config();

const getPresetsStats = async (nexus: NexusClient, layouts: TLayout[]) => {
  const results: TLayout[] = [];
  for (const layout of layouts.filter(l => l.id)) {
    const result = await nexus.Search.query(ConfigQueryBuilder(layout.id));
    results.push({
      id: layout.id,
      name: layout.name,
      stats: result.hits.total.value,
    });
  }
  return results;
};

const SearchByPresets = (props: Props) => {
  const nexus = useNexusContext();
  const { data, isSuccess, isLoading } = useQuery('nexus-search-config', {
    queryFn: () => fetchNexusSearchConfig(nexus),
    keepPreviousData: true,
  });
  const layouts: TLayout[] =
    data?.layouts.map(layout => ({
      id: layout.filters?.[0].values?.[0],
      name: layout.name,
      stats: '0',
    })) || [];
  const { data: layoutsWithStats, status } = useQuery(
    'nexus-search-config-details',
    {
      enabled: !!data && isSuccess,
      queryFn: () => getPresetsStats(nexus, layouts),
      keepPreviousData: true,
    }
  );
  const displayLayouts = unionBy(layoutsWithStats, layouts, i => i.id);
  return (
    <div className="searchby-presets">
      <h2 className="searchby-presets-title">Search By</h2>
      {(status === 'loading' || isLoading) && (
        <Spin spinning={status === 'loading'}>
          <div className="searchby-presets-container">
            {Array(8)
              .fill('')
              .map((_, i) => (
                <PresetCardItemSkeleton key={`preset-card-skeleton-${i}`} />
              ))}
          </div>
        </Spin>
      )}
      {status === 'success' && (
        <div className="searchby-presets-container">
          {(displayLayouts as TLayout[]).map(layout => (
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
      )}
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
            title={item.name}
            selected={selectedLayout === item.name}
            onChangeLayout={onChangeLayout}
          />
        ))}
      </div>
    </div>
  );
};
