export class MotivoBaja {
	private constructor(
		private readonly id: number,
		private readonly nombre: string,
		private readonly descripcion: string | null,
	) {}

	public static reconstitute(
		id: number,
		nombre: string,
		descripcion: string | null,
	): MotivoBaja {
		return new MotivoBaja(id, nombre, descripcion);
	}

	public getId(): number {
		return this.id;
	}

	public getNombre(): string {
		return this.nombre;
	}

	public getDescripcion(): string | null {
		return this.descripcion;
	}
}
