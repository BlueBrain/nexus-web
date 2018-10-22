import React from "react";
import logo from "../../public/img/logo.png";
import SearchBar from './SearchBar';
import Login from './Login';
import { WithStore } from '@bbp/nexus-react';
import { navigate } from '../store/actions';

const Header = base => (
  <header>
    <div className="logo-block">
      <a className="logo" href={base + "/"}>
        <img src={logo} />
      </a>
      <WithStore
        mapStateToProps={(state) => ({
          config: state.config
        })}
        mapDispatchToProps={{
          navigate: navigate.navigate
        }}
      >{({ config, navigate }) => <a href={config.appPath ? config.appPath : "/" } onClick={() => navigate('')}><h1>Explorer</h1></a>}
      </WithStore>
    </div>
    <SearchBar />
    <Login />
  </header>
);

export default Header;
