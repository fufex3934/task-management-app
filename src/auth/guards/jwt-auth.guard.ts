import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic before authentication if needed
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    // Custom error handling
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
