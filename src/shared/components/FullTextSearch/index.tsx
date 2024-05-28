import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommandPalette from 'react-cmdk';
import { Spin, Tag, Empty } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { getNormalizedTypes, getResourceLabel } from 'shared/utils';
import { useFullTextSearch } from './useFullTextSearch';

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

const FullTextSearch = ({ openCmdk, onOpenCmdk }: Props) => {
  const {
    search,
    onSearch,
    resetSearch,
    searchResults,
    isLoading,
  } = useFullTextSearch();

  const onChangeOpen = () => {
    onOpenCmdk();
    resetSearch();
  };

  let content = null;

  if (isLoading) {
    content = (
      <div className="search-resources-loader">
        <Spin size="large" indicator={<LoadingOutlined />} />
      </div>
    );
  } else if (!Boolean(searchResults.length) && !Boolean(search)) {
    content = <div className="search-for-placeholder">Search for ""</div>;
  } else if (!Boolean(searchResults.length) && Boolean(search)) {
    content = <Empty description="No results found" />;
  } else {
    content = searchResults.map(({ id, title, items }) => (
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
    ));
  }

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        e.stopPropagation();
        onOpenCmdk();
      }
    };

    document.addEventListener('keydown', keyDown);
    return () => document.removeEventListener('keydown', keyDown);
  }, []);

  return (
    <CommandPalette
      onChangeSearch={onSearch}
      onChangeOpen={onChangeOpen}
      search={search}
      isOpen={openCmdk}
      page="root"
      placeholder="Search for resources"
    >
      {content}
    </CommandPalette>
  );
};

export default FullTextSearch;
