import * as queryString from 'query-string';
import { useHistory, useLocation } from 'react-router';

export type QueryParams = {
  [key: string]: any;
};

export default function useQueryString() {
  const location = useLocation();
  const history = useHistory();
  const queryParams: QueryParams = queryString.parse(location.search) || {};

  const setQueryString = (newQueryParams: QueryParams) => {
    history.push(
      `${location.pathname}?${queryString.stringify(newQueryParams)}`
    );
  };

  return [queryParams, setQueryString] as [
    QueryParams,
    (newQueryParams: QueryParams) => void
  ];
}
