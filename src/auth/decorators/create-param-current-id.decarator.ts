import { ArgumentMetadata, createParamDecorator, ExecutionContext, Injectable, PipeTransform } from "@nestjs/common";
import { Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { ConfigType } from "../../configuration/configuration";

export const CurrentUserId = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.user.userId) {
      return request.user.userId;
    }
    return;
  },
);

@Injectable()
export class ParseCurrentIdDecorator implements PipeTransform {
  constructor(private configService: ConfigService<ConfigType>) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (this.configService.get('ID_TYPE') === 'MONGO') {
      return new Types.ObjectId(value);
    } else {
      return value;
    }
  }
}
