import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';

const useUserAuthenticated = (): boolean => {
  const oidc = useSelector((state: RootState) => state.oidc);
  return !!oidc?.user?.access_token;
};

export default useUserAuthenticated;
