import * as React from 'react';
import NavigationMenuComponent from './Component';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { fetchOrg } from '../../store/actions/nexus/activeOrg';
import { RootState } from '../../store/reducers';

interface MenuProps {
  defaultVisibility?: boolean;
  render: (
    visible: boolean,
    toggleVisibility: () => void
  ) => React.ReactElement<any>;
}

const NavMenuContainer: React.FunctionComponent<MenuProps> = props => {
  const { render, defaultVisibility } = props;
  const dispatch = useDispatch();
  const pageSize = useSelector(
    (state: RootState) => state.uiSettings.pageSizes.resourcesListPageSize
  );

  const goToProject = (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`));
  const activateOrg = (orgLabel: string) => dispatch(fetchOrg(orgLabel));

  return (
    <NavigationMenuComponent
      {...{
        render,
        pageSize,
        goToProject,
        activateOrg,
        defaultVisibility,
      }}
    />
  );
};

export default NavMenuContainer;
