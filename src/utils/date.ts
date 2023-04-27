export const formatDateDayMonth = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
export const formatDateRange = (startDate: Date, endDate: Date) =>
  `${formatDateDayMonth(startDate)}–${formatDateDayMonth(endDate)}`;
