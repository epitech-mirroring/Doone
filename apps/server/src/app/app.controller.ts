import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {
  @Get('/status')
  public status() {
    return { success: true };
  }
}
