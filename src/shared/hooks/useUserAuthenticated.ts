import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

const useUserAuthenticated = () => {
  const oidc = useSelector((state: RootState) => state.oidc);
  return oidc && !!oidc.user?.id_token;
};

export default useUserAuthenticated;
