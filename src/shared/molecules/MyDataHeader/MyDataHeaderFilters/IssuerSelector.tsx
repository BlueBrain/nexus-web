import { Radio, RadioChangeEvent } from 'antd';
import { THeaderProps } from 'shared/canvas/MyData/types';

type TIssuerSelectorProps = Pick<THeaderProps, 'issuer' | 'setFilterOptions'>;

const IssuerSelector = ({ issuer, setFilterOptions }: TIssuerSelectorProps) => {
  const onIssuerChange = (e: RadioChangeEvent) => setFilterOptions({ issuer: e.target.value });

  return (
    <Radio.Group
      className="my-data-header-title_issuer_selector"
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
