import { inject, injectable } from "tsyringe";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { RoleDto } from "../dtos/AccessDto";

@injectable()
export class GetAllRolesUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	public async run(): Promise<RoleDto[]> {
		const roles = await this.authorizationRepository.findAllRoles();
		return roles.map((r) => ({
			id: r.id,
			name: r.name,
			description: r.description,
			permissionIds: r.permissionIds,
		}));
	}
}
