import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  constructor(private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;

    const request = context.switchToHttp().getRequest();

    const user = await this.userService.findByIdForAuth(request.user.id);
    if (!user?.isAdmin) {
      throw new ForbiddenException();
    }

    return true;
  }
}
