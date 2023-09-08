import { ArgumentMetadata, createParamDecorator, ExecutionContext, Injectable, PipeTransform } from "@nestjs/common";
import { Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { ConfigType } from "../../configuration/configuration";

export const CurrentUserRefresh = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return {
      userId: req.user.userId,
      deviceId: req.user.deviceId,
      lastActiveDate: req.user.lastActiveDate,
    };
  },
);

@Injectable()
export class ParseCurrentRefreshPipe implements PipeTransform {
  constructor(private configService: ConfigService<ConfigType>) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (this.configService.get('ID_TYPE') === 'MONGO') {
      return {
        userId: new Types.ObjectId(value.userId),
        deviceId: value.deviceId,
        lastActiveDate: value.lastActiveDate,
      };
    } else {
      return value;
    }
  }
}
