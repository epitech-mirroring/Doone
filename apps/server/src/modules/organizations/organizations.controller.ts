import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Private } from '../auth/decorators/private.decorator';
import { AuthContext } from '../auth/auth.context';
import { CreateOrganizationDTO } from '../../dtos/organizations/organizations.dto';

@Controller('organizations')
export class OrganizationsController {
  @Inject(OrganizationsService)
  private _organizationService: OrganizationsService;

  @Inject(AuthContext)
  private _authContext: AuthContext;

  @Private()
  @Get('/:id')
  async getOrganizationById(@Param('id') id: string) {
    return this._organizationService.getOrganizationById(
      id,
      this._authContext.user,
    );
  }

  @Private()
  @Post()
  public async createOrganization(@Body() body: CreateOrganizationDTO) {
    const result = await this._organizationService.createOrganization(
      body,
      this._authContext.user,
      this._authContext.user,
    );

    if (result) {
      return result;
    }
    throw new ForbiddenException();
  }
}
