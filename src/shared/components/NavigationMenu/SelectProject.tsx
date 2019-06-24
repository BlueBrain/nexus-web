import * as React from 'react';
import { NavMenuPageProps } from './Home';
import Search from 'antd/lib/input/Search';
import { Button, Spin, Empty, Pagination } from 'antd';
import Projects from '../Nexus/Projects';
import ListItem from '../Animations/ListItem';
import { ProjectList, ProjectResponseCommon } from '@bbp/nexus-sdk';
import { FetchableState } from '../../store/reducers/utils';
import { PaginatedList } from '@bbp/nexus-sdk-legacy';
import { RequestError } from '../../store/actions/utils/errors';

interface NavMenuProjectsContainerProps extends NavMenuPageProps {
  activateOrg(orgLabel: string): void;
  goToProject(orgLabel: string, projectLabel: string): void;
  orgLabel: string;
  pageSize: number;
}

export const NavMenuProjectsContainer: React.FunctionComponent<
  NavMenuProjectsContainerProps
> = props => {
  const { path, goTo, orgLabel, goToProject, pageSize } = props;
  const [searchValue, setSearchValue] = React.useState<string>();
  const [{ from, size }, setPagination] = React.useState({
    size: pageSize,
    from: 0,
  });
  return (
    <Projects.List
      orgLabel={orgLabel}
      options={{ from, size, label: searchValue }}
    >
      {({
        data,
        error,
        loading,
      }: {
        loading: boolean;
        error?: RequestError | null;
        data: ProjectList;
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
          <NavMenuSelectProjectPage
            {...{
              path,
              goTo,
              next,
              fetchablePaginatedList,
              setSearchValue,
              searchValue,
              size,
              goToProject,
            }}
          />
        );
      }}
    </Projects.List>
  );
};

interface NavMenuSelectProjectPageProps extends NavMenuPageProps {
  searchValue?: string;
  setSearchValue(value: string): void;
  fetchablePaginatedList: FetchableState<PaginatedList<ProjectResponseCommon>>;
  next: (page: number, pageSize?: number) => void;
  size: number;
  goToProject(orgLabel: string, projectLabel: string): void;
}

export const NavMenuSelectProjectPage: React.FunctionComponent<
  NavMenuSelectProjectPageProps
> = props => {
  const {
    goToProject,
    goTo,
    setSearchValue,
    searchValue,
    fetchablePaginatedList,
    next,
    size,
  } = props;

  return (
    <div className="page -select-project">
      <h4 className="title">
        <Button
          size="small"
          onClick={() => goTo('/selectOrg')}
          icon="arrow-left"
        ></Button>{' '}
        Select an Project
      </h4>
      <Search
        placeholder={'Find a Project by name...'}
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
                ({ _organizationLabel, _label, description }) => (
                  <ListItem
                    key={_label}
                    onClick={() => goToProject(_organizationLabel, _label)}
                    id={_label}
                    label={`${_organizationLabel} / ${_label}`}
                    description={description}
                  ></ListItem>
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

export default NavMenuProjectsContainer;
