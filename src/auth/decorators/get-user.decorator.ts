import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If a specific property is requested, return that
    if (data && user[data]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return user[data];
    }

    return user;
  },
);
