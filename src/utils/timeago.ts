type IntervalType = {
  year: number;
  month: number;
  week: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function timeago(date: Date) {
  // @ts-ignore
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  let counter: number;
  for (const interval in intervals) {
    counter = Math.floor(seconds / intervals[interval as keyof IntervalType]);
    if (counter > 0) {
      if (counter === 1) {
        return `${counter} ${interval} ago`;
      } else {
        return `${counter} ${interval}s ago`;
      }
    }
  }
  return 'just now';
}

export default timeago;
