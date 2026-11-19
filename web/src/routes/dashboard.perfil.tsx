import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2, UserCircle } from "lucide-react";
import { z } from "zod";
import { CampoTexto } from "@/components/CampoTexto";
import { Button } from "@/components/ui/button";
import {
	FormErrorAnnouncer,
	getVisibleFieldErrors,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useCambiarPassword } from "@/modules/auth/hooks/useCambiarPassword";
import { passwordSchema } from "@/modules/auth/schemas";
import { useAuthStore } from "@/modules/auth/store/authStore";
import {
	useActualizarPreferenciasNotificacion,
	useObtenerPreferenciasNotificacion,
} from "@/modules/notificacion/hooks/useNotificaciones";
import {
	TIPO_NOTIFICACION_LABELS,
	type PreferenciaNotificacionDto,
} from "@/modules/notificacion/types";

export const Route = createFileRoute("/dashboard/perfil")({
	component: PerfilComponent,
});

const cambioSchema = z
	.object({
		currentPassword: z.string().min(1, "La contraseña actual es requerida"),
		newPassword: passwordSchema,
		confirm: z.string(),
	})
	.refine((v) => v.newPassword === v.confirm, {
		path: ["confirm"],
		message: "Las contraseñas no coinciden",
	});

function PerfilComponent() {
	const user = useAuthStore((state) => state.user);
	const { mutate: cambiar, isPending } = useCambiarPassword();
	const { data: prefsRemotas, isLoading: isLoadingPrefs } =
		useObtenerPreferenciasNotificacion();
	const actualizarPrefs = useActualizarPreferenciasNotificacion();
	const [prefsLocales, setPrefsLocales] = useState<
		PreferenciaNotificacionDto[]
	>([]);

	useEffect(() => {
		if (prefsRemotas) {
			setPrefsLocales(prefsRemotas);
		}
	}, [prefsRemotas]);

	const togglePref = (index: number) => {
		setPrefsLocales((prev) =>
			prev.map((item, idx) =>
				idx === index ? { ...item, inApp: !item.inApp } : item,
			),
		);
	};

	const form = useForm({
		defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
		validators: { onChange: cambioSchema },
		onSubmit: ({ value }) =>
			cambiar({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
			}),
	});

	return (
		<div className="space-y-8 py-6 animate-fade-in max-w-xl">
			<section className="flex items-center gap-3 pb-6 border-b border-border">
				<div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
					<UserCircle className="size-5" />
				</div>
				<div className="text-left">
					<h1 className="text-2xl font-extrabold tracking-tight">
						{user?.name}
					</h1>
					<p className="text-sm text-muted-foreground">
						{user?.email} · {user?.role}
					</p>
				</div>
			</section>

			<form
				noValidate
				onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
				className="space-y-4 text-left"
			>
				<form.Subscribe
					selector={(s) =>
						Object.values(s.fieldMeta).filter(
							(m) => m?.isTouched && (m.errors?.length ?? 0) > 0,
						).length
					}
				>
					{(errorCount) => <FormErrorAnnouncer errorCount={errorCount} />}
				</form.Subscribe>
				<h2 className="font-semibold">Cambiar contraseña</h2>
				<p className="text-sm text-muted-foreground">
					Al cambiarla se cerrarán todas tus sesiones y deberás iniciar sesión
					de nuevo.
				</p>
				{(["currentPassword", "newPassword", "confirm"] as const).map(
					(name) => (
						<form.Field key={name} name={name}>
							{(field) => (
								<CampoTexto
									id={name}
									type="password"
									autoComplete={
										name === "currentPassword"
											? "current-password"
											: "new-password"
									}
									label={
										{
											currentPassword: "Contraseña actual",
											newPassword: "Nueva contraseña",
											confirm: "Confirmar nueva contraseña",
										}[name]
									}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									errors={getVisibleFieldErrors(field.state.meta)}
									disabled={isPending}
								/>
							)}
						</form.Field>
					),
				)}
				<Button
					type="submit"
					disabled={isPending}
					className="cursor-pointer w-full sm:w-auto"
				>
					{isPending ? "Guardando..." : "Cambiar contraseña"}
				</Button>
			</form>

			{/* Preferencias de alertas y notificaciones */}
			<section className="space-y-4 pt-6 border-t border-border text-left">
				<div className="flex items-center gap-2">
					<Bell className="size-5 text-primary" />
					<h2 className="font-semibold">Preferencias de alertas sanitarias</h2>
				</div>
				<p className="text-sm text-muted-foreground">
					Elige qué tipos de recordatorios deseas recibir en la campana de
					notificaciones.
				</p>

				{isLoadingPrefs ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
						<Loader2 className="size-4 animate-spin" />
						Cargando preferencias...
					</div>
				) : (
					<div className="space-y-3">
						{prefsLocales.map((pref, index) => {
							const info = TIPO_NOTIFICACION_LABELS[pref.tipo];
							return (
								<label
									key={pref.tipo}
									className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border bg-card/50 cursor-pointer hover:bg-muted/30 transition-colors"
								>
									<div className="space-y-0.5">
										<p className="text-sm font-medium text-foreground">
											{info.label}
										</p>
										<p className="text-xs text-muted-foreground">
											{info.descripcion}
										</p>
									</div>
									<input
										type="checkbox"
										checked={pref.inApp}
										onChange={() => togglePref(index)}
										className="mt-1 h-4 w-4 accent-primary cursor-pointer shrink-0"
									/>
								</label>
							);
						})}

						<Button
							type="button"
							variant="outline"
							disabled={actualizarPrefs.isPending || prefsLocales.length === 0}
							onClick={() => actualizarPrefs.mutate(prefsLocales)}
							className="cursor-pointer w-full sm:w-auto"
						>
							{actualizarPrefs.isPending
								? "Guardando..."
								: "Guardar preferencias de alertas"}
						</Button>
					</div>
				)}
			</section>
		</div>
	);
}
