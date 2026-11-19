import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	extractErrorMessages,
	FormErrorAnnouncer,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useRegister } from "@/modules/auth/hooks/useRegister";
import { registerSchema } from "@/modules/auth/schemas";

export const Route = createFileRoute("/register")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: RegisterComponent,
});

function RegisterComponent() {
	const [showPassword, setShowPassword] = useState(false);
	const { mutate: register, isPending } = useRegister();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: { onChange: registerSchema },
		onSubmit: ({ value }) => {
			register({
				name: value.name.trim(),
				email: value.email.trim(),
				password: value.password,
			});
		},
	});

	return (
		<div className="flex items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
			<div className="w-full max-w-md space-y-8">
				<Card className="border border-border bg-card/60 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
					<CardHeader className="space-y-2 text-center pb-6">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
							<UserPlus className="h-6 w-6" />
						</div>
						<CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
							Crear Cuenta
						</CardTitle>
						<CardDescription className="text-muted-foreground text-sm">
							Registra tus datos para unirte al Sistema Ganadero
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							noValidate
							onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
							className="space-y-5"
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

							<form.Field name="name">
								{(field) => {
									const msgs = field.state.meta.isTouched
										? extractErrorMessages(field.state.meta.errors)
										: [];
									const invalid = msgs.length > 0;
									return (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Nombre Completo</Label>
											<div className="relative">
												<User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
												<Input
													id={field.name}
													name={field.name}
													type="text"
													autoComplete="name"
													aria-invalid={invalid ? "true" : "false"}
													aria-describedby={
														invalid ? `${field.name}-error` : undefined
													}
													placeholder="Juan Pérez"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													className="pl-10 h-11"
													disabled={isPending}
												/>
											</div>
											{invalid && (
												<p
													id={`${field.name}-error`}
													className="text-xs text-destructive text-left font-medium"
												>
													{msgs.join(", ")}
												</p>
											)}
										</div>
									);
								}}
							</form.Field>

							<form.Field name="email">
								{(field) => {
									const msgs = field.state.meta.isTouched
										? extractErrorMessages(field.state.meta.errors)
										: [];
									const invalid = msgs.length > 0;
									return (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Correo Electrónico</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
												<Input
													id={field.name}
													name={field.name}
													type="email"
													autoComplete="email"
													aria-invalid={invalid ? "true" : "false"}
													aria-describedby={
														invalid ? `${field.name}-error` : undefined
													}
													placeholder="correo@ejemplo.com"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													className="pl-10 h-11"
													disabled={isPending}
												/>
											</div>
											{invalid && (
												<p
													id={`${field.name}-error`}
													className="text-xs text-destructive text-left font-medium"
												>
													{msgs.join(", ")}
												</p>
											)}
										</div>
									);
								}}
							</form.Field>

							<form.Field name="password">
								{(field) => {
									const msgs = field.state.meta.isTouched
										? extractErrorMessages(field.state.meta.errors)
										: [];
									const invalid = msgs.length > 0;
									return (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Contraseña</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
												<Input
													id={field.name}
													name={field.name}
													type={showPassword ? "text" : "password"}
													autoComplete="new-password"
													aria-invalid={invalid ? "true" : "false"}
													aria-describedby={
														invalid
															? `${field.name}-hint ${field.name}-error`
															: `${field.name}-hint`
													}
													placeholder="Ej: ContrasenaSegura2026!"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													className="pl-10 pr-10 h-11"
													disabled={isPending}
												/>
												<button
													type="button"
													aria-label={
														showPassword
															? "Ocultar contraseña"
															: "Mostrar contraseña"
													}
													aria-pressed={showPassword}
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
											<p
												id={`${field.name}-hint`}
												className="text-[11px] text-muted-foreground text-left leading-normal"
											>
												Mín. 12 caracteres, con mayúscula, minúscula, número y
												carácter especial.
											</p>
											{invalid && (
												<p
													id={`${field.name}-error`}
													className="text-xs text-destructive text-left font-medium"
												>
													{msgs.join(", ")}
												</p>
											)}
										</div>
									);
								}}
							</form.Field>

							<Button
								type="submit"
								className="w-full h-11 text-base font-semibold cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center mt-2"
								disabled={isPending}
							>
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creando cuenta...
									</>
								) : (
									"Registrarse"
								)}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								¿Ya tienes una cuenta?{" "}
							</span>
							<Link
								to="/login"
								className="font-medium text-primary hover:underline transition-all"
							>
								Inicia sesión aquí
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
