import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { UserNotFoundError } from "@/core/user/domain/error/UserNotFoundError";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { UserAccessDto } from "../dtos/AccessDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

@injectable()
export class AssignUserDirectPermissionsUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	public async run(
		targetUserId: number,
		overrides: Array<{ permissionId: number; granted: boolean }>,
	): Promise<UserAccessDto> {
		const currentAccess =
			await this.authorizationRepository.getUserAccess(targetUserId);
		if (!currentAccess) {
			throw new UserNotFoundError();
		}

		const ids = overrides.map((o) => o.permissionId);
		const uniqueIds = [...new Set(ids)];
		if (uniqueIds.length !== ids.length) {
			throw new ValidationError(
				"No se pueden repetir permisos en las excepciones directas",
			);
		}

		if (uniqueIds.length > 0) {
			const existingPerms =
				await this.authorizationRepository.findPermissionsByIds(uniqueIds);
			if (existingPerms.length !== uniqueIds.length) {
				throw new ValidationError(
					"Uno o más permisos seleccionados no existen",
				);
			}
		}

		await this.authorizationRepository.setUserDirectPermissions(
			targetUserId,
			overrides,
		);

		const updated =
			await this.authorizationRepository.getUserAccess(targetUserId);
		if (!updated) {
			throw new UserNotFoundError();
		}

		return {
			userId: updated.userId,
			roles: updated.roles,
			directPermissions: updated.directPermissions,
			effectivePermissions: PermissionMapper.toDtoList(
				updated.effectivePermissions,
			),
		};
	}
}
