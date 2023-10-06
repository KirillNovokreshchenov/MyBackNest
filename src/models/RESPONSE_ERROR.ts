import { IdType } from './IdType';

export enum RESPONSE_ERROR {
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
}
export function isError(value): value is RESPONSE_ERROR {
  return Object.values(RESPONSE_ERROR).includes(value);
}
