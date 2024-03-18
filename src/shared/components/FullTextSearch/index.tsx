import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import CommandPalette from 'react-cmdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Tag } from 'antd';
import { groupBy } from 'lodash';

import {
  getNormalizedTypes,
  getOrgAndProjectFromProjectId,
  getResourceLabel,
} from 'shared/utils';
import 'react-cmdk/dist/cmdk.css';
import './styles.scss';

type Props = {
  openCmdk: boolean;
  onOpenCmdk(): void;
};

const TagRenderer = ({ type }: { type?: string | string[] }) => {
  if (!type) return null;
  const types = getNormalizedTypes(type);
  return (
    <div className="type-tags-list">
      {types.map(t => (
        <Tag color="blue" className="tag" title={t}>
          {t}
        </Tag>
      ))}
    </div>
  );
};

export function useFullTextSearch() {
  const [search, setSearch] = useState('');
  const nexus = useNexusContext();

  const onSearch = async (value: string) => setSearch(value);

  const { isLoading, data } = useQuery({
    enabled: !!search,
    queryKey: ['cmdk-search', { search }],
    queryFn: () =>
      nexus.Resource.list(undefined, undefined, {
        q: search,
        deprecated: false,
      }),
    select: data => data._results,
    staleTime: 2,
  });
  const resources = groupBy(data, '_project');

  const searchResults = Object.entries(resources).map(([key, value]) => {
    const orgProject = getOrgAndProjectFromProjectId(key);
    return {
      id: key,
      title: orgProject,
      items: value,
    };
  });

  return {
    search,
    onSearch,
    isLoading,
    searchResults,
  };
}

const FullTextSearch = ({ openCmdk, onOpenCmdk }: Props) => {
  const { search, onSearch, searchResults } = useFullTextSearch();

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        onOpenCmdk();
      }
    };

    document.addEventListener('keydown', keyDown);
    return () => document.removeEventListener('keydown', keyDown);
  }, []);

  return (
    <CommandPalette
      onChangeSearch={onSearch}
      onChangeOpen={onOpenCmdk}
      search={search}
      isOpen={openCmdk}
      page="root"
    >
      <CommandPalette.Page id="root">
        {searchResults.map(({ id, title, items }) => (
          <div className="cmdk-list-container" key={id}>
            <div className="cmdk-list-title">
              <Tag color="geekblue">{title?.orgLabel}</Tag>|
              <Tag color="geekblue">{title?.projectLabel}</Tag>
            </div>
            <div className="cmdk-list-content">
              {items.map(resource => {
                const label = getResourceLabel(resource);
                return (
                  <Link
                    to={`/resolve/${encodeURIComponent(resource['@id'])}`}
                    onClick={onOpenCmdk}
                    className="cmdk-list-item"
                  >
                    <div className="item-title">{label}</div>
                    <TagRenderer type={resource['@type']} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </CommandPalette.Page>
      <CommandPalette.FreeSearchAction />
    </CommandPalette>
  );
};

export default FullTextSearch;
