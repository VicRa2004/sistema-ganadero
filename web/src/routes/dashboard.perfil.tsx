import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { UserCircle } from "lucide-react";
import { z } from "zod";
import { CampoTexto } from "@/components/CampoTexto";
import { Button } from "@/components/ui/button";
import { useCambiarPassword } from "@/modules/auth/hooks/useCambiarPassword";
import { passwordSchema } from "@/modules/auth/schemas";
import { useAuthStore } from "@/modules/auth/store/authStore";

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
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-4 text-left"
			>
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
									errors={
										field.state.meta.isTouched ? field.state.meta.errors : []
									}
									disabled={isPending}
								/>
							)}
						</form.Field>
					),
				)}
				<Button type="submit" disabled={isPending}>
					{isPending ? "Guardando..." : "Cambiar contraseña"}
				</Button>
			</form>
		</div>
	);
}
