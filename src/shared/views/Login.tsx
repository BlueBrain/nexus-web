import * as React from 'react';
import { connect } from 'react-redux';
import LoginBox, { Realm } from '../components/Login';
import { push } from 'connected-react-router';
import getUserManager from '../../client/userManager';
import { RootState } from '../store/reducers';
import { UserManager } from 'oidc-client';
import * as configActions from '../store/actions/config';

export interface LoginViewProps {
  realms: Realm[];
  redirect(): void;
  setPreferredRealm(name: string): void;
  userManager?: UserManager;
}

const Login: React.FunctionComponent<LoginViewProps> = props => {
  const { realms, redirect } = props;
  if (realms.length === 0 || !realms) {
    redirect();
    return null;
  }
  return (
    <LoginBox
      realms={realms.map(r => r.name)}
      onLogin={(e: React.SyntheticEvent) => {
        e.preventDefault();
        props.userManager && props.userManager.signinRedirect();
      }}
      onRealmSelected={(name: string) => props.setPreferredRealm(name)}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth } = state;

  return {
    realms: (auth.realms && auth.realms.data && auth.realms.data.results) || [],
    userManager: getUserManager(state),
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  redirect: () => dispatch(push('/')),
  setPreferredRealm: (name: string) =>
    dispatch(configActions.setPreferredRealm(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
