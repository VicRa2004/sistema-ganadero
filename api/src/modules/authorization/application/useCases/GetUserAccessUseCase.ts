import { inject, injectable } from "tsyringe";
import { UserNotFoundError } from "@/core/user/domain/error/UserNotFoundError";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { UserAccessDto } from "../dtos/AccessDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

@injectable()
export class GetUserAccessUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	public async run(userId: number): Promise<UserAccessDto> {
		const access = await this.authorizationRepository.getUserAccess(userId);
		if (!access) {
			throw new UserNotFoundError();
		}

		return {
			userId: access.userId,
			roles: access.roles,
			directPermissions: access.directPermissions,
			effectivePermissions: PermissionMapper.toDtoList(
				access.effectivePermissions,
			),
		};
	}
}
