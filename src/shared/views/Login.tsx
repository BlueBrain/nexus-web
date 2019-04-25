import * as React from 'react';
import { connect } from 'react-redux';
import { Realm } from '@bbp/nexus-sdk';
import LoginBox from '../components/Login';
import { push } from 'connected-react-router';
import getUserManager from '../../client/userManager';
import { RootState } from '../store/reducers';
import { UserManager } from 'oidc-client';
import * as configActions from '../store/actions/config';

export interface LoginViewProps {
  realms: Realm[];
  redirect(): void;
  setPreferredRealm(name: string): void;
  preferredRealm?: string;
  userManager?: UserManager;
}

const Login: React.FunctionComponent<LoginViewProps> = props => {
  const { realms, redirect } = props;
  const defaultRealm: Realm =
    realms.find(r => r.label === props.preferredRealm) || props.realms[0];
  console.log({ realms });

  const [preferredRealm, setPreferredRealm] = React.useState(defaultRealm.name);

  if (realms.length === 0 || !realms) {
    redirect();
    return null;
  }
  return (
    <LoginBox
      realms={realms.map(r => r.name)}
      selectedRealm={preferredRealm}
      onLogin={(e: React.SyntheticEvent) => {
        e.preventDefault();
        props.setPreferredRealm(preferredRealm);
        props.userManager && props.userManager.signinRedirect();
      }}
      onRealmSelected={(name: string) => setPreferredRealm(name)}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth, config } = state;

  return {
    realms:
      (auth.realms &&
        auth.realms.data &&
        auth.realms.data.results &&
        auth.realms.data.results.filter(
          r => r.label !== 'serviceaccounts' && !r.deprecated
        )) ||
      [],
    userManager: getUserManager(state),
    preferredRealm: config.preferredRealm || undefined,
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
