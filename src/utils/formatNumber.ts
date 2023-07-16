function formatNumber(num: number) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} m`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} k`;
  }
  return num;
}

const prettifyNumber = (num: number | string): string => {
  // use Intl.NumberFormat to format the number
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
  return new Intl.NumberFormat('en-US').format(Number(num));
};

export { prettifyNumber };

export default formatNumber;
