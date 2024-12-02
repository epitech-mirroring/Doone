import { Controller, Get, Inject } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Private } from '../auth/decorators/private.decorator';
import { AuthContext } from '../auth/auth.context';

@Controller('organizations')
export class OrganizationsController {
  @Inject(OrganizationsService)
  private _organizationService: OrganizationsService;

  @Inject(AuthContext)
  private _authContext: AuthContext;

  @Private()
  @Get('/mine')
  async getUserOrganizations() {
    return this._organizationService.getOrganizationsForUser(
      this._authContext.user.id,
    );
  }
}
