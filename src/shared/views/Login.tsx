import * as React from 'react';
import { connect } from 'react-redux';
import { Realm } from '@bbp/nexus-sdk';
import LoginBox from '../components/Login';
import { push } from 'connected-react-router';
import getUserManager from '../../client/userManager';
import { RootState } from '../store/reducers';
import { UserManager } from 'oidc-client';
import * as configActions from '../store/actions/config';
import { notification } from 'antd';

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

  const [preferredRealm, setPreferredRealm] = React.useState(defaultRealm.name);

  if (realms.length === 0 || !realms) {
    redirect();
    return null;
  }
  return (
    <LoginBox
      realms={realms.map(r => r.name)}
      selectedRealm={preferredRealm}
      onLogin={async (e: React.SyntheticEvent) => {
        try {
          e.preventDefault();
          props.setPreferredRealm(preferredRealm);
          props.userManager && (await props.userManager.signinRedirect());
        } catch (error) {
          switch (error.message) {
            case 'Network Error':
              notification.error({
                message: 'We could not log you in',
                description: (
                  <div>
                    <p>
                      Nexus Web could not connect to the openId provider
                      configured for this instance.
                    </p>{' '}
                    <p>Please contact your system administrators.</p>
                  </div>
                ),
                duration: 0,
              });
              break;
            default:
              notification.error({
                message: 'We could not log you in',
                description: (
                  <div>
                    <p>An unknown problem occured.</p>{' '}
                    <p>Please contact your system administrators.</p>
                  </div>
                ),
                duration: 0,
              });
              break;
          }
        }
      }}
      onRealmSelected={(name: string) => setPreferredRealm(name)}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth, config } = state;
  const userManager = getUserManager(state);
  return {
    userManager,
    realms:
      (auth.realms &&
        auth.realms.data &&
        auth.realms.data.results &&
        auth.realms.data.results.filter(
          r => r.label !== 'serviceaccounts' && !r.deprecated
        )) ||
      [],
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
