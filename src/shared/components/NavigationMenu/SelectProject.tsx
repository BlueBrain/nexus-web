import * as React from 'react';
import { NavMenuPageProps } from './Home';
import Search from 'antd/lib/input/Search';
import { Icon, Spin, Empty } from 'antd';
import { Projects } from '@bbp/react-nexus';
import ListItem from '../Animations/ListItem';
import { ProjectList } from '@bbp/nexus-sdk';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';

interface NavMenuProjectsContainerProps extends NavMenuPageProps {
  activateOrg(orgLabel: string): void;
}

export const NavMenuProjectsContainer: React.FunctionComponent<
  NavMenuProjectsContainerProps
> = props => {
  const { path, goTo } = props;
  const [searchValue, setSearchValue] = React.useState<string>();
  const orgLabel = useSelector(
    (state: RootState) =>
      state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.data &&
      state.nexus.activeOrg.data.org.label
  );
  return (
    <Projects.List orgLabel={orgLabel} options={{ label: searchValue }}>
      {({
        data,
        error,
        loading,
      }: {
        loading: boolean;
        error: Error;
        data: ProjectList;
      }) => {
        return (
          <NavMenuSelectProjectPage
            {...{
              path,
              goTo,
              error,
              loading,
              data,
              setSearchValue,
              searchValue,
            }}
          />
        );
      }}
    </Projects.List>
  );
};

interface NavMenuSelectProjectPageProps extends NavMenuPageProps {
  error: Error;
  loading: boolean;
  data: ProjectList;
  searchValue?: string;
  setSearchValue(value: string): void;
}

export const NavMenuSelectProjectPage: React.FunctionComponent<
  NavMenuSelectProjectPageProps
> = props => {
  const { path, goTo, setSearchValue, searchValue, loading, data } = props;
  return (
    <div>
      <h3>
        <a onClick={() => goTo('/selectOrg')}>
          <Icon type="arrow-left" />
        </a>{' '}
        Select a Project
      </h3>
      <Search
        allowClear={true}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <div>
        <Spin spinning={loading}>
          {data && !data._total && <Empty>No Orgs found</Empty>}
          <ul>
            {data &&
              data['_results'].map(({ _label }) => (
                <ListItem
                  // onClick={() => activateOrg(_label)}
                  id={_label}
                  label={_label}
                ></ListItem>
              ))}
          </ul>
        </Spin>
      </div>
    </div>
  );
};

export default NavMenuProjectsContainer;
