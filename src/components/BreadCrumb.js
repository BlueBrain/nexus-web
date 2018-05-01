import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import FontAwesome from "react-fontawesome";
import { navigate } from "../store/actions";

const Crumb = (entity, id, pickEntity) => (
  <a onClick={() => (pickEntity ? pickEntity({ entity, id }) : () => {})}>
    <div className="crumb">{id}</div>
  </a>
);

const BreadCrumbComponent = ({
  org,
  domain,
  schema,
  ver,
  goDown,
  pickEntity,
  badEntity
}) => {
  // we don't need instance because it's always covered by the modal
  const className = org
    ? "bread-crumb shadow flex expanded"
    : "bread-crumb flex closed";
  if (badEntity) {
    return null;
  }
  return (
    <div className={className}>
      {org && Crumb("org", org, pickEntity)}
      {domain && (
        <div className="crumb spacer">
          <FontAwesome name="angle-right" />
        </div>
      )}
      {domain && Crumb("domain", domain, pickEntity)}
      {schema && (
        <div className="crumb spacer">
          <FontAwesome name="angle-right" />
        </div>
      )}
      {schema && Crumb("schema", schema + "_" + ver, pickEntity)}
      {org && (
        <a onClick={() => goDown()}>
          <div className="crumb action">
            <FontAwesome name="step-backward" />
          </div>
        </a>
      )}
    </div>
  );
};

BreadCrumbComponent.propTypes = {
  org: PropTypes.string,
  domain: PropTypes.string,
  schema: PropTypes.string,
  ver: PropTypes.string,
  badEntity: PropTypes.string,
  goDown: PropTypes.func,
  pickEntity: PropTypes.func
};

function mapStateToProps({ pick, list }) {
  const state = pick;
  return {
    badEntity: list.error ? list.error.entity : null,
    org: state.org,
    domain: state.domain,
    schema: state.schema,
    ver: state.ver
  };
}

function mapDispatchToProps(dispatch) {
  return {
    pickEntity: bindActionCreators(navigate.pickEntity, dispatch),
    goDown: bindActionCreators(navigate.goDown, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  BreadCrumbComponent
);
