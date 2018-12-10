import * as React from 'react';
import { matchPath } from 'react-router';
import { RootState } from '../../store/reducers';
import { NavLink } from 'react-router-dom';
import routes, { RouteWithData } from '../../routes';
import { connect } from 'react-redux';
import './Breadcrumb.less';

export interface Breadcrumb {
  // should be a component
  component: React.ReactNode;
  path: string;
}

export interface GetBreadcrumbProps {
  state: RootState;
  location: any;
  routes: RouteWithData[];
}

export interface BreadcrumbProps {
  dividerComponent?: React.FunctionComponent;
  breadcrumbs: Breadcrumb[];
}

export interface BreadcrumbContainerProps {
  dividerComponent?: React.FunctionComponent;
  state: RootState;
}

const DefaultDividerComponent: React.FunctionComponent = () => {
  return <span>{'/'}</span>;
};

const DEFAULT_MATCH_OPTIONS = { exact: true };

const getBreadcrumbs = ({ location, routes, state }: GetBreadcrumbProps) => {
  // always show home
  const matches: Breadcrumb[] = [
    {
      component: <div className="breadcrumb-label">{'Home'}</div>,
      path: '/',
    },
  ];
  const { pathname } = location;

  pathname
    .replace(/\/$/, '')
    .split('/')
    .reduce((previous: any, current: any) => {
      const pathSection = `${previous}/${current}`;
      const match = routes.find(
        matchOptions =>
          !!matchPath(pathSection, {
            ...(matchOptions || DEFAULT_MATCH_OPTIONS),
            path: matchOptions.path,
          })
      );

      if (match) {
        let label = pathSection;
        if (match.breadcrumbLabel) {
          label = match.breadcrumbLabel(state);
        }
        matches.push({
          component: <div className="breadcrumb-label">{label}</div>,
          path: pathSection,
        });
      }

      return pathSection;
    });

  return matches;
};

const BreadcrumbsListComponent: React.FunctionComponent<BreadcrumbProps> = ({
  breadcrumbs,
  dividerComponent = DefaultDividerComponent,
}) => {
  return (
    <ul className="breadcrumb-list">
      {breadcrumbs.map(({ component, path }: Breadcrumb, index: number) => (
        <li key={path}>
          <NavLink to={path}>{component}</NavLink>
          {!!(index < breadcrumbs.length - 1) && dividerComponent({})}
        </li>
      ))}
    </ul>
  );
};

const BreadcrumbsContainer: React.FunctionComponent<
  BreadcrumbContainerProps
> = ({ dividerComponent = DefaultDividerComponent, state }) => {
  const location = state.router && state.router.location;
  const breadcrumbs = getBreadcrumbs({ location, routes, state });
  return BreadcrumbsListComponent({ breadcrumbs, dividerComponent });
};

const mapStateToProps = (state: RootState) => ({
  state,
});

export default connect(mapStateToProps)(BreadcrumbsContainer);
