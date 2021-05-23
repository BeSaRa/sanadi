export interface IDatepickerCustomOptions {
  disablePeriod: 'none' | 'past' | 'future';
  format?: string;
  disableToday?: boolean;
  ignoreDays?: number;
  readonly?: boolean;
}
