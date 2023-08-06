import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

export const CurrentUserRefresh = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return {
      userId: new Types.ObjectId(req.user.userId),
      deviceId: new Types.ObjectId(req.user.deviceId),
      lastActiveDate: req.user.lastActiveDate,
    };
  },
);
