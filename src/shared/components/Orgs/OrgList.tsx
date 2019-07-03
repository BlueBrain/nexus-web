import * as React from 'react';
import { OrgResponseCommon, OrganizationList } from '@bbp/nexus-sdk';
import * as InfiniteScroll from 'react-infinite-scroll-component';
import Search from 'antd/lib/input/Search';
import OrgItem from './OrgItem';
import { useNexus } from '@bbp/react-nexus';
import './Orgs.less';
import { Spin } from 'antd';

const DEFAULT_PAGE_SIZE = 20;

export interface OrgListContainerProps {
  pageSize?: number;
  onOrgClick?(org: OrgResponseCommon): void;
  onOrgEdit?(org: OrgResponseCommon): void;
}

export const OrgsListContainer: React.FunctionComponent<
  OrgListContainerProps
> = props => {
  const { pageSize = DEFAULT_PAGE_SIZE, onOrgClick, onOrgEdit } = props;

  const [{ from, size, label, deprecated }, setQuery] = React.useState({
    size: pageSize,
    from: 0,
    label: '',
    deprecated: false,
  });

  const { loading, error, data } = useNexus<OrganizationList>(
    nexus =>
      nexus.Organization.list({
        from,
        size,
        label,
        deprecated,
      }),
    [from, size, label, deprecated]
  );

  const onLoadMore = () => {
    setQuery({
      label,
      deprecated,
      size,
      from: from + size,
    });
  };

  const setSearchValue = (value: string) => {
    setQuery({
      deprecated,
      size,
      label: value,
      from: 0,
    });
  };

  return (
    <OrgListComponent
      {...{
        loading,
        onOrgClick,
        onOrgEdit,
        onLoadMore,
        setSearchValue,
        searchValue: label,
        page: from,
        total: (data && data._total) || 0,
        results: (data && data._results) || [],
      }}
    />
  );
};

export interface OrgListProps {
  onOrgClick?(org: OrgResponseCommon): void;
  onOrgEdit?(org: OrgResponseCommon): void;
  results: OrgResponseCommon[];
  page: number;
  total: number;
  onLoadMore(): void;
  searchValue?: string;
  setSearchValue(value: string): void;
}

export const OrgListComponent: React.FunctionComponent<
  OrgListProps
> = props => {
  const {
    onOrgClick,
    onOrgEdit,
    results,
    onLoadMore,
    page,
    total,
    searchValue,
    setSearchValue,
  } = props;

  const [items, setItems] = React.useState<OrgResponseCommon[]>([]);
  const hasMore = items.length < total;

  React.useEffect(() => {
    if (page === 0) {
      setItems(results);
      return;
    }
    setItems([...items, ...results]);
  }, [page, results]);

  return (
    <div className="org-list">
      <Search
        placeholder={'Find an Org by name...'}
        allowClear={true}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <div className="scroll" id="scroll-me">
        <InfiniteScroll
          dataLength={total}
          next={onLoadMore}
          hasMore={hasMore}
          loader={<Spin spinning={true}>Loading</Spin>}
          scrollableTarget="scroll-me"
        >
          {items.map((org, index) => (
            <OrgItem
              key={`${org._label}-${index}`}
              label={org._label}
              description={org.description}
              onClick={() => !!onOrgClick && onOrgClick(org)}
              onEdit={() => !!onOrgEdit && onOrgEdit(org)}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default OrgsListContainer;
