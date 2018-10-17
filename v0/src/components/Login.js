import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-jss";
import { Auth, WithStore } from "@bbp/nexus-react";
import { auth } from "../store/actions";
import CopyToClipboard from "./CopyToClipboard";

const CopyToken = styled("small")({
  fontSize: "12px",
  backgroundColor: "white",
  padding: "1em",
  borderRadius: "2px",
  "& a": {
    color: "#888",
    transition: "color 200ms"
  },
  "& a.copied": {
    color: "rgba(185, 233, 212, 1)"
  }
});

const CopyTokenContainer = ({ copied }) => (
  <CopyToken>
    <a
      className={copied ? "copied" : ""}
      target="_blank"
      rel="noopener noreferrer"
    >
      {" "}
      copy token{" "}
    </a>
  </CopyToken>
);

CopyTokenContainer.propTypes = {
  copied: PropTypes.bool
};

const Login = () => (
  <WithStore
    mapStateToProps={({ auth, config }) => ({
      name: auth.tokenOwner,
      token: auth.token,
      loginURI: config.loginURI
    })}
    mapDispatchToProps={{
      authenticate: auth.authenticate,
      logout: auth.logout
    }}
  >
    {({ name, loginURI, authenticate, logout, token }) => (
      <Fragment>
        {token && (
          <CopyToClipboard text={"copy token to clipboard"} value={token}>
            <CopyTokenContainer />
          </CopyToClipboard>
        )}
        <div className="login-block">
          <Auth.Container
            name={name}
            authenticate={() => authenticate(window.location.href)}
            logout={logout}
            loginURI={loginURI}
          />
        </div>
      </Fragment>
    )}
  </WithStore>
);

export default Login;
