import * as React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import StudioContainer from '../containers/StudioContainer';
import useQueryString from '../../../shared/hooks/useQueryString';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient, ACL } from '@bbp/nexus-sdk/es';
import StudioReactContext from './../contexts/StudioContext';

const writableStudio = async (permissionsPath: string, nexus: NexusClient) => {
  const aclList = await nexus.ACL.list(permissionsPath, {
    ancestors: true,
    self: true,
  });
  const acls = aclList._results as ACL[];
  let isWritable = false;
  const WRITABLE_ACL = 'resources/write';

  acls.forEach(aclContainer => {
    if (aclContainer.acl) {
      aclContainer.acl.forEach(acl => {
        if (acl.permissions.includes(WRITABLE_ACL)) {
          isWritable = true;
        }
      });
    }
  });
  return isWritable;
};

const StudioView: React.FunctionComponent<{}> = () => {
  const { orgLabel, projectLabel, studioId } = useParams<{
    orgLabel: string;
    projectLabel: string;
    studioId: string;
  }>();
  const permissionsPath = `/${orgLabel}/${projectLabel}`;
  const [queryParams, setQueryString] = useQueryString();
  const { workspaceId, dashboardId } = queryParams;
  const [isWritable, setIsWritable] = React.useState<boolean>(false);
  const nexus = useNexusContext();

  React.useEffect(() => {
    writableStudio(permissionsPath, nexus).then(value => {
      setIsWritable(value);
    });
  }, [orgLabel, projectLabel]);

  const contextValue = React.useMemo(
    () => ({
      isWritable,
      workspaceId,
      dashboardId,
      orgLabel: orgLabel as string,
      projectLabel: projectLabel as string,
      studioId: studioId as string,
    }),
    [orgLabel, projectLabel, workspaceId, dashboardId, studioId, isWritable]
  );
  return (
    <>
      <div
        className="project-banner no-bg"
        style={{
          marginBottom: 20,
        }}
      >
        <div className="label">
          <h1 className="name">
            <span>
              <Link to={`/orgs/${orgLabel}`}>{orgLabel}</Link>
              {' | '}
              <Link to={`/orgs/${orgLabel}/${projectLabel}`}>
                {projectLabel}
              </Link>
            </span>
          </h1>
        </div>
      </div>
      <div className="studio-view">
        <StudioReactContext.Provider value={contextValue}>
          <StudioContainer />
        </StudioReactContext.Provider>
      </div>
    </>
  );
};

export default StudioView;
