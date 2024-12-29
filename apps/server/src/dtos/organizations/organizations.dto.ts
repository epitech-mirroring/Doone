import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
