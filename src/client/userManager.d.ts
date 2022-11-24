import { UserManager } from 'oidc-client';
import { RootState } from '../shared/store/reducers';
declare const getUserManager: (state: RootState) => UserManager | undefined;
export default getUserManager;
