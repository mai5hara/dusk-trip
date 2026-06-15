import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { loginBodySchema } from '@mood-trip/validators';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: unknown) {
    const parsed = loginBodySchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.authService.login(parsed.data.email, parsed.data.password);
  }
}
