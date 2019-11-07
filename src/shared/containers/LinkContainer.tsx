import * as React from 'react';
import useLinks, { PathOptions } from '../hooks/useLinks';
import Link from '../components/Link';

const LinkContainer: React.FunctionComponent<{
  viewName: string;
  pathOptions?: PathOptions;
}> = ({ viewName, pathOptions = {}, children }) => {
  const { makeUriFromPathOptions, goTo } = useLinks();
  const path = makeUriFromPathOptions(viewName, pathOptions);

  return (
    <Link
      goTo={() => {
        console.log({ viewName, pathOptions, path });
        goTo(viewName, pathOptions);
      }}
      path={path}
    >
      {children}
    </Link>
  );
};

export default LinkContainer;
