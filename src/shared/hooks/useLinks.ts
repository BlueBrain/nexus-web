import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

const useLinks = () => {
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);

  const makeResourceUri = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    return `${basePath}/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };

  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    history.push(makeResourceUri(orgLabel, projectLabel, resourceId));
  };

  const makeProjectUri = (orgLabel: string, projectLabel: string) => {
    return `${basePath}/${orgLabel}/${projectLabel}`;
  };

  const goToProject = (orgLabel: string, projectLabel: string) => {
    history.push(makeProjectUri(orgLabel, projectLabel));
  };

  const makeOrgUri = (orgLabel: string) => {
    return `${basePath}/${orgLabel}`;
  };

  const goToOrg = (orgLabel: string) => {
    history.push(makeOrgUri(orgLabel));
  };

  const makeOrgsListUri = () => {
    return `${basePath}/`;
  };

  const goToOrgsList = () => {
    history.push(makeOrgsListUri());
  };

  return {
    makeResourceUri,
    goToResource,
    makeProjectUri,
    goToProject,
    makeOrgUri,
    goToOrg,
    makeOrgsListUri,
    goToOrgsList,
  };
};

export default useLinks;
