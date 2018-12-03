import * as React from 'react';
import RawQueryView from '../components/RawQueryView/RawQueryView';
import { RouteComponentProps } from 'react-router';

export const RawElasticSearchQuery: React.FunctionComponent<RouteComponentProps> = () : JSX.Element => {
  return (
    <RawQueryView viewType="es" />
  );
};

export const RawSparqlQuery: React.FunctionComponent<RouteComponentProps> = () : JSX.Element => {
  return (
    <RawQueryView viewType="sparql" />
  );
};
