import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
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
import { ALLOW_PUBLIC_REGISTER } from "@/config/features";
import {
	extractErrorMessages,
	FormErrorAnnouncer,
	handleFormSubmitWithFocus,
} from "@/lib/formAccessibility";
import { useLogin } from "@/modules/auth/hooks/useLogin";
import { loginSchema } from "@/modules/auth/schemas";

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginComponent,
});

function LoginComponent() {
	const [showPassword, setShowPassword] = useState(false);
	const { mutate: login, isPending } = useLogin();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: { onChange: loginSchema },
		onSubmit: ({ value }) => {
			login({ email: value.email.trim(), password: value.password });
		},
	});

	return (
		<div className="flex items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
			<div className="w-full max-w-md space-y-8">
				<Card className="border border-border bg-card/60 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
					<CardHeader className="space-y-2 text-center pb-6">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Lock className="h-6 w-6" />
						</div>
						<CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
							Iniciar Sesión
						</CardTitle>
						<CardDescription className="text-muted-foreground text-sm">
							Introduce tus credenciales para acceder al sistema
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							noValidate
							onSubmit={(e) => handleFormSubmitWithFocus(e, form.handleSubmit)}
							className="space-y-6"
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
													autoComplete="current-password"
													aria-invalid={invalid ? "true" : "false"}
													aria-describedby={
														invalid ? `${field.name}-error` : undefined
													}
													placeholder="••••••••"
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
													className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
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

							<Button
								type="submit"
								className="w-full h-11 text-base font-semibold cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center"
								disabled={isPending}
							>
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Iniciando sesión...
									</>
								) : (
									"Acceder al Sistema"
								)}
							</Button>
						</form>

						{ALLOW_PUBLIC_REGISTER && (
							<div className="mt-6 text-center text-sm">
								<span className="text-muted-foreground">
									¿No tienes cuenta?{" "}
								</span>
								<Link
									to="/register"
									className="font-medium text-primary hover:underline transition-all"
								>
									Regístrate aquí
								</Link>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
