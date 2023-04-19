function formatNumber(num: number) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} m`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} k`;
  }
  return num;
}

export default formatNumber;
