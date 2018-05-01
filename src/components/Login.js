import React from "react";
import { Auth, WithStore } from "@bbp/nexus-react";
import { auth } from "../store/actions";

const Login = () => (
  <div className="login-block">
    <WithStore
      mapStateToProps={({ auth, config }) => ({
        name: auth.tokenOwner,
        loginURI: config.loginURI
      })}
      mapDispatchToProps={{
        authenticate: auth.authenticate,
        logout: auth.logout
      }}
    >
      {({ name, loginURI, authenticate, logout }) => (
        <Auth.Container
          name={name}
          authenticate={() => authenticate(window.location.href)}
          logout={logout}
          loginURI={loginURI}
        />
      )}
    </WithStore>
  </div>
);

export default Login;
