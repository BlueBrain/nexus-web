import * as queryString from 'qs';
import { useHistory, useLocation } from 'react-router';

export type QueryParams = {
  [key: string]: any;
};

export default function useQueryString() {
  const location = useLocation();
  const history = useHistory();
  const queryParams: QueryParams =
    queryString.parse(location.search, { ignoreQueryPrefix: true }) || {};
  const setQueryString = (newQueryParams: QueryParams, path?: string) => {
    const newPath = `${path || location.pathname}?${queryString.stringify(newQueryParams)}`;
    history.push(newPath);
  };

  return [queryParams, setQueryString] as [
    QueryParams,
    (newQueryParams: QueryParams, path?: string) => void
  ];
}
