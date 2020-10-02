import * as React from 'react';
// import { useParams, useHistory } from 'react-router';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import * as queryString from 'query-string';

// type StudioContextType = {
//   orgLabel: string;
//   projectLabel: string;
//   studioId: string;
//   workspaceId?: string | undefined;
//   dashboardId?: string | undefined;
//   workspaces: TabItem[];
//   dashboards: TabItem[];
// };
// type StudioResource = Resource<{
//   label: string;
//   description?: string;
//   workspaces: [string];
// }>;
type QueryParams = {
  [key: string]: any;
};

// export const StudioContext = React.createContext<StudioContextType>({
//   orgLabel: '',
//   projectLabel: '',
//   studioId: '',
//   workspaces: [],
//   dashboards: []
// });

const StudioTestView: React.FunctionComponent<{}> = () => {
  const [count, setCount] = React.useState<number>(0);
  const location = useLocation();
  const history = useHistory();
  const params = useParams();

  const queryParams: QueryParams = queryString.parse(location.search) || {};
  React.useEffect(() => {
    setCount(Math.random());
  }, [queryParams.X]);
  return (
    <>
      <div>{count}</div>
      <div>{params.toString()}</div>
      <button
        onClick={() => {
          history.push(`${location.pathname}?X=Y&f=${Math.random()}`);
        }}
      >
        Click me
      </button>
    </>
  );
};

export default StudioTestView;
