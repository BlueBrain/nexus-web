import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import ReactTooltip from 'react-tooltip'
import moment from 'moment'
import Relationship from './Relationship';
import { guidGenerator } from '../../libs/utils';
import { Properties, mapToPropertyComponent } from './Properties';

const DateProperty = (name, value) => {
  return (
    <div className="property date bordered-box">
      <div className="handle"></div>
      <div className="container">
        <ReactTooltip
          id={name}
          className='small-tooltip'
          effect='solid'
        />
        <div className="category-icon" data-for={name} data-tip="date">
          <FontAwesome name="calendar" />
        </div>
        <div className="key">{name}</div>
        <div className="value ellipsis">{moment(value).format('MMM Do YYYY, h:mm:ss a')}</div>
      </div>
    </div>
  )
}

const StringProperty = (name, value) => {
  return (
    <div className="property short-text bordered-box">
      <div className="handle"></div>
      <div className="container">
        <ReactTooltip
          id={name}
          className='small-tooltip'
          effect='solid'
        />
        <div className="category-icon" data-for={name} data-tip="Short Text">
          <FontAwesome name="font" />
        </div>
        <div className="key">{name}</div>
        <div className="value">{value}</div>
      </div>
    </div>
  )
}

const MeasurementProperty = (name, value) => {
  let unit, measure, label;
  if (value.unitText) {
    unit = value.unitText;
    measure = value.value;
  } else {
    // sometimes units appear nested, with values
    unit = value.value.unitText
    measure = value.value.value
    label = Object.keys(value)
      .filter(key => key != 'value')
      .map(key => value[key]).join()
  }
  return (
    <div className="property measurement bordered-box">
      <div className="handle"></div>
      <div className="container">
        <ReactTooltip
          id={name}
          className='small-tooltip'
          effect='solid'
        />
        <div className="category-icon" data-for={name} data-tip="measurement">
          <FontAwesome name="calculator" />
        </div>
        <div className="key">{name}</div>
        { label &&
          <div className="label">{label}</div>
        }
        <div className="value">{measure}</div>
        <div className="unit">{unit}</div>
      </div>
    </div>
  )
}

const ListProperty = (name, value) => {
  return (
    <div className="property-list container unbordered-box">
      <div className="property list">
        <div className="container">
          <ReactTooltip
            id={name}
            className='small-tooltip'
            effect='solid'
          />
          <div className="category-icon" data-for={name} data-tip="List">
            <FontAwesome name="list" />
          </div>
          <div className="key">{name}</div>
        </div>
      </div>
      <ul>
        {value.map(entity => mapToPropertyComponent(name, entity))}
      </ul>
    </div>
  );
}

const ObjectProperty = (name, value) => {
  return (
    <div className="property-list container unbordered-box">
      <div className="property object">
        <div className="container">
          <ReactTooltip
            id={name}
            className='small-tooltip'
            effect='solid'
          />
          <div className="category-icon" data-for={name} data-tip="Object">
            <FontAwesome name="object-group" />
          </div>
          <div className="key">{name}</div>
        </div>
      </div>
      <ul>
        <Properties key={guidGenerator()} instance={value} />
      </ul>
    </div>
  );
}

const PropertyComponent = ({ type, name, value }) => {
  let component;
  switch (type) {
    case 'date':
      component = DateProperty;
      break;
    case 'measurement':
      component = MeasurementProperty;
      break;
    case 'relationship':
      component = Relationship;
      break;
    case 'list':
      component = ListProperty;
      break;
    case 'object':
      component = ObjectProperty;
      break;
    default:
      component = StringProperty;
  }
  return (
    <li key={guidGenerator()}>
      {component(name, value)}
    </li>
  );
}

PropertyComponent.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
};

export default PropertyComponent;