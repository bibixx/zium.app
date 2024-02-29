import { format } from "date-fns";

export const formatDateDayShortMonth = (date: Date) => format(date, "d MMM");
export const formatDateDayLongMonthYear = (date: Date) => format(date, "d MMMM yyyy");
export const formatDateDayShortMonthRange = (startDate: Date, endDate: Date) =>
  `${formatDateDayShortMonth(startDate)}–${formatDateDayShortMonth(endDate)}`;
export const formatDateDayLongMonthYearTime = (date: Date) => format(date, "d MMMM yyyy 'at' HH:mm");
export const formatDateDayShortMonthYear = (date: Date) => format(date, "MMM d, yyyy");
