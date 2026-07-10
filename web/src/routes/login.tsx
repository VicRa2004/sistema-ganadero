import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { useLogin } from "@/modules/auth/hooks/useLogin";
import { formatApiError } from "@/lib/utils";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

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
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const { mutate: login, isPending } = useLogin();

	// Configuración de formulario con TanStack Form
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setErrorMsg(null);
			login(value, {
				// biome-ignore lint/suspicious/noExplicitAny: error from react-query onError callback
				onError: (error: any) => {
					setErrorMsg(formatApiError(error));
				},
			});
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
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							{errorMsg && (
								<div className="p-3 text-sm text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15 rounded-lg border border-red-500/30 text-center font-medium animate-shake">
									{errorMsg}
								</div>
							)}

							{/* Campo Email */}
							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "El correo electrónico es requerido.";
										if (!/\S+@\S+\.\S+/.test(value)) {
											return "Introduce un correo electrónico válido.";
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Correo Electrónico</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type="email"
												placeholder="correo@ejemplo.com"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pl-10 h-11"
												disabled={isPending}
											/>
										</div>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 text-left font-medium animate-fade-in">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>

							{/* Campo Contraseña */}
							<form.Field
								name="password"
								validators={{
									onChange: ({ value }) => {
										if (!value) return "La contraseña es requerida.";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor={field.name}>Contraseña</Label>
										</div>
										<div className="relative">
											<Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type={showPassword ? "text" : "password"}
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pl-10 pr-10 h-11"
												disabled={isPending}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
												tabIndex={-1}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										{field.state.meta.isTouched &&
											field.state.meta.errors.length > 0 && (
												<p className="text-xs text-red-600 dark:text-red-400 text-left font-medium animate-fade-in">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</div>
								)}
							</form.Field>

							{/* Botón de Submit */}
							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
								})}
							>
								{({ canSubmit }) => (
									<Button
										type="submit"
										className="w-full h-11 text-base font-semibold cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center"
										disabled={isPending || !canSubmit}
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
								)}
							</form.Subscribe>
						</form>

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">¿No tienes cuenta? </span>
							<Link
								to="/register"
								className="font-medium text-primary hover:underline transition-all"
							>
								Regístrate aquí
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
