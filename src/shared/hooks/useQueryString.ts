import * as queryString from 'query-string';
import { useHistory } from 'react-router';

export type QueryParams = {
  [key: string]: any;
};

export default function useQueryString() {
  const history = useHistory();
  const queryParams: QueryParams =
    queryString.parse(history.location.search) || {};

  const setQueryString = (newQueryParams: QueryParams) => {
    history.push(
      `${history.location.pathname}?${queryString.stringify(newQueryParams)}`
    );
  };

  return [queryParams, setQueryString] as [
    QueryParams,
    (newQueryParams: QueryParams) => void
  ];
}
