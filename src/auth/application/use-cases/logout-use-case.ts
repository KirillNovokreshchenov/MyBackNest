import { DeviceRepository } from "../../../sessions/infrastructure/device.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserFromRefreshType } from "../../api/input-model/user-from-refresh.type";

export class LogoutCommand {
  constructor(public userFromRefresh: UserFromRefreshType) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private sessionRepo: DeviceRepository) {}
  async execute(command: LogoutCommand) {
    return this.sessionRepo.logout(command.userFromRefresh);
  }
}
