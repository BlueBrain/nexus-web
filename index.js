import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router";
import { ConnectedRouter } from "react-router-redux";
import App from "./src/components/App";
import Explore from "./src/components/Explorer";
import Search from "./src/components/Search";
import store from "./src/store";
import history from "./src/libs/history";
import { WithStyle } from "@bbp/nexus-react";

ReactDOM.render(
  <WithStyle
    render={() => (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App>
            <Switch>
              <Route path="/search" component={Search} />
              <Route path="/*" component={Explore} />
            </Switch>
          </App>
        </ConnectedRouter>
      </Provider>
    )}
  />,
  document.getElementById("explorer-app")
);
