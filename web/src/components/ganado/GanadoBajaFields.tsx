import { AlertTriangle } from "lucide-react";
import { CampoSelect } from "@/components/CampoSelect";
import { CampoTexto } from "@/components/CampoTexto";
import type { MotivoBajaDto } from "@/modules/ganado/types";

interface GanadoBajaFieldsProps {
	fechaBaja: string;
	motivoBajaId: string;
	motivosBaja: MotivoBajaDto[];
	isCargandoMotivos: boolean;
	disabled: boolean;
	onFechaChange: (val: string) => void;
	onMotivoChange: (val: string) => void;
}

export function GanadoBajaFields({
	fechaBaja,
	motivoBajaId,
	motivosBaja,
	isCargandoMotivos,
	disabled,
	onFechaChange,
	onMotivoChange,
}: GanadoBajaFieldsProps) {
	return (
		<fieldset className="space-y-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/10">
			<legend className="px-1.5 flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400">
				<AlertTriangle className="size-4 text-red-500" />
				Información de Baja
			</legend>
			<p className="text-xs text-muted-foreground">
				Este animal se encuentra marcado como dado de baja. Puedes actualizar la
				fecha y el motivo de baja a continuación:
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<CampoTexto
					id="fechaBaja"
					label="Fecha de Baja"
					type="date"
					value={fechaBaja}
					max={new Date().toISOString().split("T")[0]}
					onChange={(e) => onFechaChange(e.target.value)}
					disabled={disabled}
				/>
				<CampoSelect
					id="motivoBajaId"
					label="Motivo de Baja"
					value={motivoBajaId}
					onChange={(e) => onMotivoChange(e.target.value)}
					disabled={disabled || isCargandoMotivos}
				>
					<option value="">
						{isCargandoMotivos
							? "Cargando motivos..."
							: "Seleccione un motivo..."}
					</option>
					{motivosBaja.map((m) => (
						<option key={m.id} value={m.id}>
							{m.nombre}
						</option>
					))}
				</CampoSelect>
			</div>
		</fieldset>
	);
}
