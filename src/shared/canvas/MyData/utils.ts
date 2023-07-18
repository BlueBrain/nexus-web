import * as moment from 'moment';
import { TDateFilterType } from './types';

const makeDatetimePattern = ({
  dateFilterType,
  singleDate,
  dateStart,
  dateEnd,
}: {
  dateFilterType?: TDateFilterType;
  singleDate?: string;
  dateStart?: string;
  dateEnd?: string;
}) => {
  switch (dateFilterType) {
    case 'after': {
      if (!!singleDate && moment(singleDate).isValid()) {
        return `${singleDate}..*`;
      }
      return undefined;
    }
    case 'before': {
      if (!!singleDate && moment(singleDate).isValid()) {
        return `*..${singleDate}`;
      }
      return undefined;
    }
    case 'range': {
      if (
        !!dateStart &&
        !!dateEnd &&
        moment(dateStart).isValid() &&
        moment(dateEnd).isValid() &&
        moment(dateStart).isBefore(moment(dateEnd), 'days')
      ) {
        return `${dateStart}..${dateEnd}`;
      }
      return undefined;
    }
    default:
      return undefined;
  }
};

export { makeDatetimePattern };
