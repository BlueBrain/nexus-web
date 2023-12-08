import './styles.scss';

import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import * as Sentry from '@sentry/browser';
import Select, { DefaultOptionType } from 'antd/lib/select';
import { isString } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import { normalizeString } from '../../utils/stringUtils';
import isValidUrl from '../../utils/validUrl';
import { AggregatedBucket, useAggregations } from './DataExplorerUtils';

interface Props {
  defaultValue?: string;
  orgAndProject?: string[];
  onSelect: (type: string | undefined) => void;
}

export const TypeSelector: React.FC<Props> = ({
  defaultValue,
  onSelect,
  orgAndProject,
}: Props) => {
  const { data: aggregatedTypes, isSuccess } = useAggregations(
    'types',
    orgAndProject
  );
  const [showClearIcon, setShowClearIcon] = useState(false);
  const allOptions = [...(aggregatedTypes?.map(typeToOption) ?? [])];
  const [displayedOptions, setDisplayedOptions] = useState(allOptions);

  const optionsRef = useRef(allOptions);

  useEffect(() => {
    if (isSuccess) {
      optionsRef.current = [...(aggregatedTypes?.map(typeToOption) ?? [])];
      setDisplayedOptions(optionsRef.current);
    }
  }, [isSuccess, aggregatedTypes]);
  return (
    <div className="form-container">
      <span className="label">Type: </span>
      <Select
        labelInValue
        options={displayedOptions}
        onSearch={text => {
          const filteredOptions = optionsRef.current?.filter(option =>
            normalizeString(option.key).includes(text)
          );
          setDisplayedOptions(filteredOptions);
        }}
        filterOption={false}
        onSelect={(text, option) => {
          setShowClearIcon(true);
          onSelect(option.key);
        }}
        removeIcon={true}
        suffixIcon={showClearIcon ? <CloseOutlined /> : <SearchOutlined />}
        showSearch={true}
        allowClear={{
          clearIcon: <CloseOutlined data-testid="reset-type-button" />,
        }}
        onClear={() => {
          setDisplayedOptions(optionsRef.current);
          setShowClearIcon(false);
          onSelect(undefined);
        }}
        placeholder="All types"
        aria-label="type-filter"
        bordered={false}
        className="search-input"
        popupClassName="search-menu"
        value={defaultValue}
      />
    </div>
  );
};

const typeToOption = (typeBucket: AggregatedBucket): TypeOption => {
  const typeKey = typeBucket.key;

  const typeLabel =
    isString(typeKey) && isValidUrl(typeKey)
      ? typeKey.split('/').pop()
      : typeKey;

  if (!typeLabel) {
    Sentry.captureException('Invalid type received from delta', {
      extra: {
        typeBucket,
      },
    });
  }

  return {
    value: typeKey,
    label: <span title={typeKey}>{typeLabel}</span>,
    key: typeKey,
    id: typeKey,
  };
};

type TypeOption = DefaultOptionType;
