import { RESOURCE_METADATA_KEYS } from '../../constants';

export const filterMetadataFromPayload = (payload: { [key: string]: any }) => {
  return Object.keys(payload)
    .filter(key => !RESOURCE_METADATA_KEYS.includes(key))
    .reduce(
      (prev, currentKey) => ({
        ...prev,
        [currentKey]: payload[currentKey],
      }),
      { context: {} } // Payload type demands a context always
    );
};
