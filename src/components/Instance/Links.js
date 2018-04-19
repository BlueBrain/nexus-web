import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { navigate } from '../../store/actions';
import Relationship from '../shapes/Relationship';

const LinksComponent = (links, which) => {
  return <div className={links.length ? "links fade in" : "links fade"}>
    <div>{links.length  && <h3>{which} links</h3>}</div>
    <ul>
    {links.map(({ source }) => {
          return (
            <li key={source['@id']}>
              <Relationship value={source} />
            </li>
          )
        })}
    </ul>
  </div>
}

class LinksContainer extends React.Component {
  constructor (props) {
    super(props)
    const { resolvedLinks, which } = props;
    if (!which) {
      console.error(
        new Error('missing a which property to tell if its incoming or outgoing')
      );
    }
    this.state = {
      links: resolvedLinks ? resolvedLinks[which] : []
    };
  }
  componentWillReceiveProps ({ resolvedLinks, which }) {
    if (resolvedLinks && which) {
      this.setState({ links: resolvedLinks[which] });
    } else {
      this.setState({ links: [] });
    }
  }
  render() {
    return LinksComponent(this.state.links, this.props.which);
  }
}

function mapDispatchToProps (dispatch) {
  return {
    goToEntityByID: bindActionCreators(navigate.goToEntityByID, dispatch)
  };
}

LinksContainer.propTypes = {
  resolvedLinks: PropTypes.any,
  which: PropTypes.string
};

export default connect(null, mapDispatchToProps)(LinksContainer);
