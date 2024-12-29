import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../types';
import { RequestScope } from 'nj-request-scope';

@Injectable()
@RequestScope()
export class AuthContext {
  private _user: Omit<User, 'actions'> | undefined = undefined;

  public set user(user: Omit<User, 'actions'> | undefined) {
    this._user = user;
  }

  public get user(): Omit<User, 'actions'> {
    if (!this._user) {
      throw new InternalServerErrorException('User not authenticated');
    }
    return this._user;
  }

  get authenticated(): boolean {
    return !!this._user;
  }
}
