import { IdOf, User } from '../index';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type TokenPayload = {
  sub: IdOf<User>;
  type: TokenType;
};
