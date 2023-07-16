import { Radio, RadioChangeEvent } from 'antd';
import { THeaderFilterProps } from 'shared/canvas/MyData/types';

type TIssuerSelectorProps = Pick<
  THeaderFilterProps,
  'issuer' | 'setFilterOptions'
>;

const IssuerSelector = ({ issuer, setFilterOptions }: TIssuerSelectorProps) => {
  const onIssuerChange = (e: RadioChangeEvent) =>
    setFilterOptions({ issuer: e.target.value });

  return (
    <Radio.Group
      defaultValue={'createdBy'}
      value={issuer}
      onChange={onIssuerChange}
    >
      <Radio className="radio-filter" value="createdBy">
        Created by me
      </Radio>
      <Radio className="radio-filter" value="updatedBy">
        Last updated by me
      </Radio>
    </Radio.Group>
  );
};

export default IssuerSelector;
