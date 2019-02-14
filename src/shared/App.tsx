import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import MainLayout from './layouts/MainLayout';
import './App.less';
import { Modal } from 'antd';
import { push } from 'connected-react-router';
import { useTransition, animated } from 'react-spring';

interface ModalSwitchProps {
  location: any;
  match: any;
  history: any;
  goDown: () => void;
}

const ModalSwitch: React.FunctionComponent<ModalSwitchProps> = props => {
  const { location, children, history, match, goDown } = props;
  const [previousLocation, setPreviousLocation] = React.useState(null);
  React.useEffect(
    () => {
      // set previousLocation if props.location is not modal
      if (
        history.action !== 'POP' &&
        (!location.state || !location.state.modal)
      ) {
        setPreviousLocation(location);
      }
    },
    [location, children, history, match]
  );

  const isModal = !!(
    !!previousLocation &&
    location.state &&
    location.state.modal &&
    previousLocation !== location
  ); // not initial render

  const DEFAULT_ANIMATIONS = {
    initial: {
      right: 0,
      opacity: 1,
    },
    from: {
      right: -50,
      opacity: 0,
    },
    leave: { right: 50, opacity: 0 },
    enter: {
      right: 0,
      opacity: 1,
    },
  };

  const modalLocation = isModal ? previousLocation : location;
  const transitions = useTransition(
    modalLocation,
    location => location.pathname,
    DEFAULT_ANIMATIONS
  );

  const Route = transitions.map(({ item: location, props, key }) => (
    <animated.div className="route" key={key} style={props}>
      <Switch location={location}>{children}</Switch>
    </animated.div>
  ));

  return (
    <div className="routes-container">
      {Route}
      {isModal ? (
        <Modal visible={true} width={900} footer={null} onCancel={goDown}>
          <Switch location={location}>{children}</Switch>
        </Modal>
      ) : null}
    </div>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  const goDownOnePathSegmentFromPathname = (pathname: string) => {
    const newPath = [...pathname.split('/')];
    newPath.pop();
    return newPath.join('/');
  };
  return {
    goDown: () => {
      dispatch(
        push(goDownOnePathSegmentFromPathname(ownProps.location.pathname))
      );
    },
  };
};

const ConnectedModalSwitch = connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalSwitch);

export default class App extends React.Component {
  render() {
    return (
      <MainLayout>
        <Route
          render={props => (
            <ConnectedModalSwitch {...props}>
              {routes.map(({ path, component: C, ...rest }) => (
                <Route
                  key={path as string}
                  path={path}
                  component={C}
                  {...rest}
                />
              ))}
              <Route component={NotFound} />
            </ConnectedModalSwitch>
          )}
        />
      </MainLayout>
    );
  }
}
