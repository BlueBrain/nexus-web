import * as React from 'react';
import { Avatar, Tooltip, Tag } from 'antd';
import * as Identicon from 'identicon.js';
import './Types.less';
import * as md5 from 'md5';
import { getPaletteFromURL } from 'color-thief-node';

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(component: number) {
  const hex = component.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export interface TypesIconProps {
  type: string;
}

const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  const [colors, setColor] = React.useState<string[] | null>(null);
  const typeString = type.toString();
  // must use a hash as Identicon requires a string of atleast 15 chars
  // (making the resulting image effectively a visual hash)
  const typeHash = md5(typeString);
  const iconSizeInPixels = 20;
  const imageData = new Identicon(typeHash, iconSizeInPixels).toString();
  const src = `data:image/png;base64,${imageData}`;
  if (!colors) {
    getPaletteFromURL(src).then((colors: [number, number, number][]) => {
      const hexColors = colors.map(color => rgbToHex.apply(null, color));
      setColor(hexColors);
    });
  }
  let style = {};
  if (colors) {
    const [backgroundColor, highlightColor] = colors;
    style = {
      backgroundColor,
      color: highlightColor,
      border: `1px solid ${highlightColor}50`,
    };
  }
  return (
    <li className="types-icon">
      <Tooltip title={typeString}>
        <Tag style={style}>
          <Avatar size="small" shape="square" src={src} />
          <span className="label">{typeString}</span>
        </Tag>
      </Tooltip>
    </li>
  );
};

export interface TypesIconListProps {
  type: string[];
  full?: boolean;
}

// type represents the field @type
const TypesIconList: React.SFC<TypesIconListProps> = ({
  type,
  full = false,
}) => {
  let typesToDisplay = type;
  const tooManyTypes = !full && type.length > 3;
  if (tooManyTypes) {
    typesToDisplay = [...type].slice(0, 3);
  }
  return (
    <ul className="types-list">
      {typesToDisplay.map((type: string) => (
        <TypesIcon type={type} key={type} />
      ))}
      {tooManyTypes && (
        <li className="ellipsis">
          {`...${type.length - typesToDisplay.length}+`}
        </li>
      )}
    </ul>
  );
};

export default TypesIconList;
