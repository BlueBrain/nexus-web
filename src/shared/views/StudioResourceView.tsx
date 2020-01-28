import * as React from 'react';
import { useParams } from 'react-router';

const StudioResourceView: React.FunctionComponent<{}> = () => {
  const { orgLabel, projectLabel, resourceId } = useParams();

  console.log(
    'orgLabel, projectLabel, resourceId',
    orgLabel,
    projectLabel,
    resourceId
  );

  return <div>Studio Resource View</div>;
};

export default StudioResourceView;
