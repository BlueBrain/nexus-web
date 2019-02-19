import * as React from 'react';
import { RouteProps, match } from 'react-router-dom';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import Project from './views/Project';
import Resource from './views/Resource';
import { fetchOrgs } from './store/actions/nexus/orgs';
import { fetchOrg } from './store/actions/nexus/activeOrg';
import { RawElasticSearchQuery, RawSparqlQuery } from './views/RawQuery';
import ACLView from './views/ACLs';
import { fetchAndAssignProject } from './store/actions/nexus/projects';
import { fetchAndAssignResource } from './store/actions/nexus/resource';
import { ThunkAction } from './store';
import { RootState } from './store/reducers';
import {
  ProjectBreadcrumbLabel,
  HomeBreadcrumbLabel,
  OrgBreadcrumbLabel,
  LoginBreadcrumbLabel,
  RawQueryBreadcrumbLabel,
  ResourceBreadcrumbLabel,
  ACLsBreadcrumbLabel,
} from './views/breadcrumbs/BreadcrumbLabels';
import { fetchAcls } from './store/actions/auth';

export interface RouteWithData extends RouteProps {
  breadcrumbLabel?: any;
  loadData?(state: RootState, match: match | null): ThunkAction;
}
const routes: RouteWithData[] = [
  {
    path: '/',
    exact: true,
    component: Landing,
    breadcrumbLabel: HomeBreadcrumbLabel,
    loadData: () => fetchOrgs(),
  },
  {
    path: '/login',
    breadcrumbLabel: LoginBreadcrumbLabel,
    component: Login,
  },
  {
    path: '/:org',
    exact: true,
    component: Home,
    breadcrumbLabel: OrgBreadcrumbLabel,
    loadData: (state, match) =>
      fetchOrg(match && match.params && (match.params as any)['org']),
  },
  {
    path: '/:org/:project',
    exact: true,
    component: Project,
    breadcrumbLabel: ProjectBreadcrumbLabel,
    loadData: (state, match) => async (dispatch, getState, state) => {
      await fetchOrg(match && match.params && (match.params as any)['org'])(
        dispatch,
        getState,
        state
      );
      await fetchAndAssignProject(
        match && match.params && (match.params as any)['org'],
        match && match.params && (match.params as any)['project']
      )(dispatch, getState, state);
    },
  },
  {
    path: '/:org/:project/resources/:resourceId',
    component: Resource,
    breadcrumbLabel: ResourceBreadcrumbLabel,
    loadData: (state, match) => async (dispatch, getState, state) => {
      await fetchOrg(match && match.params && (match.params as any)['org'])(
        dispatch,
        getState,
        state
      );
      await fetchAndAssignProject(
        match && match.params && (match.params as any)['org'],
        match && match.params && (match.params as any)['project']
      )(dispatch, getState, state);
      await fetchAndAssignResource(
        match && match.params && (match.params as any)['org'],
        match && match.params && (match.params as any)['project'],
        match && match.params && (match.params as any)['resourceId']
      )(dispatch, getState, state);
    },
  },
  {
    path: '/:org/:project/_search',
    component: RawElasticSearchQuery,
    breadcrumbLabel: RawQueryBreadcrumbLabel,
  },
  {
    path: '/:org/:project/:view/_search',
    component: RawElasticSearchQuery,
    breadcrumbLabel: RawQueryBreadcrumbLabel,
  },
  {
    path: '/:org/:project/graph/sparql',
    component: RawSparqlQuery,
    breadcrumbLabel: RawQueryBreadcrumbLabel,
  },
  {
    path: '/:org/:project/_settings/acls',
    component: ACLView,
    breadcrumbLabel: ACLsBreadcrumbLabel,
    loadData: (state, match) => {
      const orgLabel = match && match.params && (match.params as any)['org'];
      const projectLabel =
        match && match.params && (match.params as any)['project'];

      return fetchAcls(`${orgLabel}/${projectLabel}`, { ancestors: true });
    },
  },
];

export default routes;
