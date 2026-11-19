import { inject, injectable } from "tsyringe";
import { ValidationError } from "@/core/shared/domain/error/ValidationError";
import { UserNotFoundError } from "@/core/user/domain/error/UserNotFoundError";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { UserAccessDto } from "../dtos/AccessDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

@injectable()
export class AssignUserRolesUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	public async run(
		targetUserId: number,
		roleIds: number[],
		actorUserId: number,
	): Promise<UserAccessDto> {
		const uniqueRoleIds = [...new Set(roleIds)];
		if (uniqueRoleIds.length === 0) {
			throw new ValidationError(
				"El usuario debe tener al menos un rol asignado",
			);
		}

		const currentAccess =
			await this.authorizationRepository.getUserAccess(targetUserId);
		if (!currentAccess) {
			throw new UserNotFoundError();
		}

		const roles =
			await this.authorizationRepository.findRolesByIds(uniqueRoleIds);
		if (roles.length !== uniqueRoleIds.length) {
			throw new ValidationError(
				"Uno o más roles seleccionados no existen o están inactivos",
			);
		}

		const teniaAdmin = currentAccess.roles.some((r) => r.name === "ADMIN");
		const conservaAdmin = roles.some((r) => r.name === "ADMIN");
		if (actorUserId === targetUserId && teniaAdmin && !conservaAdmin) {
			throw new ValidationError(
				"No puedes quitarte el rol ADMIN a tu propia cuenta",
			);
		}

		await this.authorizationRepository.setUserRoles(
			targetUserId,
			uniqueRoleIds,
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
