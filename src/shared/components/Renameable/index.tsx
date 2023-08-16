import * as React from 'react';
import { Input, Tooltip } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import './Renameable.scss';

interface RenameableItemProps {
  defaultValue: string;
  onChange: (value: string) => void;
  size?: SizeType;
}

const RenameableItem: React.FunctionComponent<RenameableItemProps> = ({
  defaultValue,
  onChange,
  size,
}) => {
  const inputEl = React.useRef(null);
  const [{ value, editing }, set] = React.useState({
    value: defaultValue,
    editing: false,
  });

  const onPressEnter = function(e: any) {
    set({ value, editing: false });
    onChange(value);
  };

  const onInputChange = function(e: any) {
    const value = e.target.value;
    set({ value, editing });
  };

  React.useEffect(() => {
    if (editing && inputEl && inputEl.current) {
      // false reporting of "never"
      (inputEl.current as any).focus();
    }
  });
  return (
    <div
      className={`renameable-item ${editing ? '-editing' : ''}`}
      onClick={() => set({ value, editing: true })}
    >
      {editing && (
        <Input
          ref={inputEl}
          value={value}
          onPressEnter={onPressEnter}
          onChange={onInputChange}
          onBlur={onPressEnter}
          size={size}
        />
      )}
      {!editing && (
        <Tooltip title="click to edit!" mouseEnterDelay={0.3}>
          <span>{value}</span>
        </Tooltip>
      )}
    </div>
  );
};

export default RenameableItem;
