import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { navigate } from '../../store/actions';
import FontAwesome from 'react-fontawesome';
import ReactTooltip from 'react-tooltip';
import Type from './Type';
import { guidGenerator } from '../../libs/utils';

const KeyLinkComponent = ({ isExternalLink, id, goToEntityByID, children }) => {
  if (isExternalLink) {
    return <a href={id} target="_blank">{children}</a>
  }
  return <a onClick={() => goToEntityByID(id)}>{children}</a>
}

KeyLinkComponent.propTypes = {
  isExternalLink: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  goToEntityByID: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired
};

const RelationshipComponent = ({ isExternalLink, name, value, label, status, goToEntityByID }) => {
  let id = value['@id'];
  let component;
  switch (status) {
    case 'loading':
      component = Loading(name, value);
      break;
    // TODO figure out what to do here
    case 'failure':
      component = Fulfilled(name, value, label);
      break;
    case 'fulfilled':
    default:
      component = Fulfilled(name, value, label);
  }
  let toolTipID = guidGenerator();
  return (
    <KeyLinkComponent isExternalLink={isExternalLink} id={id} goToEntityByID={goToEntityByID} >
      <div className="property relationship bordered-box">
        <div className="handle"></div>
        <div className="container">
          <ReactTooltip
            id={toolTipID}
            className='small-tooltip'
            effect='solid'
          />
          <div className="category-icon" data-for={toolTipID} data-tip={isExternalLink ? "external resource" : "link to instance"}>
            { isExternalLink ?
              <FontAwesome name="external-link"/> :
              <FontAwesome name="link"/>
            }
          </div>
          {component}
        </div>
      </div>
    </KeyLinkComponent>
  );
};

RelationshipComponent.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  api: PropTypes.string.isRequired,
  label: PropTypes.string,
  status: PropTypes.string.isRequired,
  goToEntityByID: PropTypes.func.isRequired,
  isExternalLink: PropTypes.bool
};

const Loading = (name, value) =>
  <React.Fragment>
    {name && <div className="key ellipsis">
      {name}{' '}
    </div>}
    <div className="value">
      <FontAwesome
        name='spinner'
        spin
        style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
      />{' '}
    </div>
    <div className="value">
        { value['@type'] &&
          <Type type={value['@type']} />
        }
    </div>
  </React.Fragment>;

const Fulfilled = (name, value, label) => {
  let id = guidGenerator()
  return (
    <React.Fragment>
      <ReactTooltip
        id={id}
        className='small-tooltip'
        effect='solid'
      />
      {name && <div className="key ellipsis">
        {name}{' '}
      </div>}
      <div className="value ellipsis" data-for={id} data-tip={label}>
        <i>{label}</i>{' '}
      </div>
      <div className="value">
        { value['@type'] &&
          <Type type={value['@type']} />
        }
      </div>
    </React.Fragment>
  );
};

class RelationshipContainer extends React.Component {
  constructor(props) {
    super(props);
    let { name, value, api } = props;
    const valueId = typeof value === 'object' && value['@id'] ? value['@id'] : '';
    const isOntology = valueId.indexOf('http') < 0;
    const isExternalLink = valueId.indexOf(api) < 0;
    this.state = {
      status: isOntology || isExternalLink ? 'fulfilled' : 'loading',
      name: name ? name : null,
      value,
      label: value.label,
      isExternalLink,
      // ID these have special identifers, they should fetch ids from context
      isOntology
    };
  }
  componentDidMount() {
    this.fetchInstance()
  }
  fetchInstance() {
    if (this.state.isOntology) { return; }
    if (this.state.isExternalLink) { return; }
    const access_token = this.props.token;
    const requestOptions = access_token? { headers: { "Authorization": "Bearer "+ access_token } }: {};
    return fetch(this.props.value['@id'], requestOptions)
      .then(response => response.json())
      .then(data => {
        let label = data['skos:prefLabel'] || data['rdfs:label'] || data['schema:name'] || data['name'];
        if (!label) {
          let split = data['@id'].split('-')
          label = split[split.length - 1 ]
        }
        this.setState({
          status: 'fulfilled',
          label,
          value: data
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({ status: 'failure' });
      });
  }
  render() { return RelationshipComponent({...this.props, ...this.state}) }
}

function mapStateToProps({ config, auth }) {
  return {
    token: auth.token,
    api: config.api
  };
}

function mapDispatchToProps (dispatch) {
  return {
    goToEntityByID: bindActionCreators(navigate.goToEntityByID, dispatch),
  }
}

RelationshipContainer.propTypes = {
  name: PropTypes.string,
  value: PropTypes.any.isRequired,
  api: PropTypes.string.isRequired,
  label: PropTypes.string,
  goToEntityByID: PropTypes.func.isRequired,
  token: PropTypes.string
};


export default connect(mapStateToProps, mapDispatchToProps)(RelationshipContainer);
