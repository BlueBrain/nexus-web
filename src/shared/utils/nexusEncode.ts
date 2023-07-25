const nexusUrlHardEncode = (url: string): string => {
  return encodeURIComponent(decodeURIComponent(url));
};

export default nexusUrlHardEncode;
