import * as React from 'react';
import { NavMenuPageProps } from './Home';
import Search from 'antd/lib/input/Search';
import { Spin, Empty, Pagination, Button } from 'antd';
import Orgs from '../Nexus/Orgs';
import ListItem from '../Animations/ListItem';
import { OrganizationList, OrgResponseCommon } from '@bbp/nexus-sdk';
import { FetchableState } from '../../store/reducers/utils';
import { PaginatedList } from '@bbp/nexus-sdk-legacy';
import { RequestError } from '../../store/actions/utils/errors';

interface NavMenuOrgsContainerProps extends NavMenuPageProps {
  activateOrg(orgLabel: string): void;
  pageSize: number;
}

export const NavMenuOrgsContainer: React.FunctionComponent<
  NavMenuOrgsContainerProps
> = props => {
  const { path, goTo, activateOrg, pageSize } = props;
  const [searchValue, setSearchValue] = React.useState<string>();
  const [{ from, size }, setPagination] = React.useState({
    size: pageSize,
    from: 0,
  });
  return (
    <Orgs.List options={{ from, size, label: searchValue }}>
      {({
        data,
        error,
        loading,
      }: {
        loading: boolean;
        error?: RequestError | null;
        data: OrganizationList;
      }) => {
        const next = (pageNumber: number) => {
          setPagination({
            size,
            from: size * pageNumber - size,
          });
        };

        const fetchablePaginatedList = {
          error,
          isFetching: loading,
          data: {
            total: (data && data['_total']) || 0,
            results: (data && data['_results']) || [],
            index: from,
          },
        };

        return (
          <NavMenuSelectOrgPage
            {...{
              activateOrg,
              path,
              goTo,
              next,
              fetchablePaginatedList,
              setSearchValue,
              searchValue,
              size,
            }}
          />
        );
      }}
    </Orgs.List>
  );
};

interface NavMenuSelectOrgPageProps extends NavMenuPageProps {
  activateOrg(orgLabel: string): void;
  searchValue?: string;
  setSearchValue(value: string): void;
  fetchablePaginatedList: FetchableState<PaginatedList<OrgResponseCommon>>;
  next: (page: number, pageSize?: number) => void;
  size: number;
}

export const NavMenuSelectOrgPage: React.FunctionComponent<
  NavMenuSelectOrgPageProps
> = props => {
  const {
    activateOrg,
    goTo,
    setSearchValue,
    searchValue,
    fetchablePaginatedList,
    next,
    size,
  } = props;

  return (
    <div className="page -select-org">
      <h4 className="title">
        <Button
          size="small"
          onClick={() => goTo('/')}
          icon="arrow-left"
        ></Button>{' '}
        Select an Organziation
      </h4>
      <Search
        placeholder={'Find an Org by name...'}
        allowClear={true}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <div>
        {fetchablePaginatedList.data && (
          <Spin spinning={fetchablePaginatedList.isFetching}>
            <ul className="list">
              {!fetchablePaginatedList.data.total && (
                <Empty description="No orgs found" />
              )}
              {fetchablePaginatedList.data.results.map(
                ({ _label, description }) => (
                  <ListItem
                    onClick={() => {
                      activateOrg(_label);
                      goTo(`/selectProject/${_label}`);
                    }}
                    key={_label}
                    id={_label}
                    label={_label}
                    description={description}
                  />
                )
              )}
              {fetchablePaginatedList.data.total > size && (
                <Pagination
                  simple
                  onChange={next}
                  current={
                    Math.round(fetchablePaginatedList.data.index / size) + 1
                  }
                  pageSize={size}
                  total={fetchablePaginatedList.data.total}
                />
              )}
            </ul>
          </Spin>
        )}
      </div>
    </div>
  );
};

export default NavMenuOrgsContainer;
