import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
  refreshBodySchema,
} from '@mood-trip/validators';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetPasswordService } from './reset-password.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @Post('login')
  async login(@Body() body: unknown) {
    const parsed = loginBodySchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.authService.login(parsed.data.email, parsed.data.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: unknown) {
    const parsed = forgotPasswordBodySchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.resetPasswordService.requestPasswordReset(parsed.data.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: unknown) {
    const parsed = resetPasswordBodySchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.resetPasswordService.resetPassword(
      parsed.data.token,
      parsed.data.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: { user: { id: string } }) {
    return this.authService.getMe(req.user.id);
  }

  @Post('refresh')
  async refresh(@Body() body: unknown) {
    const parsed = refreshBodySchema.safeParse(body);

    if(!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.authService.refresh(parsed.data.refreshToken);
  }
}
