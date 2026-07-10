import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: DashboardComponent,
});

function DashboardComponent() {
	// Datos estáticos provisionales para simular el dashboard
	const stats = [
		{
			name: "Cabezas de Ganado",
			value: "148",
			change: "+12% este mes",
			icon: "🐄",
			gradient: "from-blue-500/10 to-indigo-500/10",
			border: "border-blue-500/20",
			textColor: "text-blue-400",
		},
		{
			name: "Ranchos Activos",
			value: "4",
			change: "Sin cambios",
			icon: "🏡",
			gradient: "from-emerald-500/10 to-teal-500/10",
			border: "border-emerald-500/20",
			textColor: "text-emerald-400",
		},
		{
			name: "Tratamientos en Curso",
			value: "12",
			change: "-3 respecto a la semana pasada",
			icon: "💊",
			gradient: "from-amber-500/10 to-orange-500/10",
			border: "border-amber-500/20",
			textColor: "text-amber-400",
		},
		{
			name: "Insumos Bajos",
			value: "3",
			change: "Requiere atención inmediata",
			icon: "📦",
			gradient: "from-rose-500/10 to-pink-500/10",
			border: "border-rose-500/20",
			textColor: "text-rose-400",
		},
	];

	const recentActivities = [
		{
			id: 1,
			action: "Registro de nuevo ganado",
			target: "Vaca #104 (Raza Angus)",
			time: "Hace 10 min",
			icon: "➕",
		},
		{
			id: 2,
			action: "Tratamiento aplicado",
			target: "Toro #23 (Vacuna Anual)",
			time: "Hace 1 hora",
			icon: "💉",
		},
		{
			id: 3,
			action: "Traslado de lote",
			target: "Rancho 'El Cacao' a 'La Loma'",
			time: "Hace 3 horas",
			icon: "🚚",
		},
		{
			id: 4,
			action: "Inventario actualizado",
			target: "Alimento concentrado (-50kg)",
			time: "Ayer",
			icon: "📝",
		},
	];

	return (
		<div className="flex flex-col gap-8 animate-fade-in">
			{/* Welcome Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
				<div className="absolute top-0 right-0 -mt-4 -mr-4 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl" />

				<div className="relative z-10">
					<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent md:text-4xl">
						¡Bienvenido al Panel de Control!
					</h1>
					<p className="mt-2 text-slate-400 max-w-xl text-sm leading-relaxed">
						Gestiona tu producción ganadera, controla inventarios de insumos,
						monitorea la salud de tus animales y optimiza el rendimiento de tus
						ranchos desde un solo lugar.
					</p>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<div
						key={stat.name}
						className={`rounded-xl border ${stat.border} bg-slate-900/50 bg-gradient-to-br ${stat.gradient} p-6 shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`}
					>
						<div className="flex items-center justify-between">
							<span className="text-3xl">{stat.icon}</span>
							<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
								{stat.name}
							</span>
						</div>
						<div className="mt-4">
							<h3 className="text-3xl font-bold text-white">{stat.value}</h3>
							<p className={`mt-1 text-xs font-medium ${stat.textColor}`}>
								{stat.change}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* Detailed Sections Grid */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Recent Activity */}
				<div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
					<div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
						<h2 className="text-lg font-bold text-white">Actividad Reciente</h2>
						<span className="text-xs text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">
							Ver todo
						</span>
					</div>

					<div className="flex flex-col gap-4">
						{recentActivities.map((activity) => (
							<div
								key={activity.id}
								className="flex items-start gap-4 rounded-lg bg-slate-900/40 p-4 border border-slate-850 hover:border-slate-800 transition-colors"
							>
								<div className="text-xl bg-slate-800 rounded-lg p-2 flex items-center justify-center">
									{activity.icon}
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-slate-200">
										{activity.action}
									</p>
									<p className="text-xs text-slate-400 mt-0.5">
										{activity.target}
									</p>
								</div>
								<span className="text-xs text-slate-500 whitespace-nowrap">
									{activity.time}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Quick Actions / Shortcuts */}
				<div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
					<div className="border-b border-slate-800 pb-4 mb-6">
						<h2 className="text-lg font-bold text-white">Accesos Rápidos</h2>
					</div>

					<div className="grid grid-cols-1 gap-4">
						<button
							type="button"
							className="flex items-center gap-3 w-full text-left rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white p-3 font-medium transition-all shadow-lg hover:shadow-indigo-500/20"
						>
							<span>🐄</span>
							<span className="text-sm">Registrar Ganado</span>
						</button>
						<button
							type="button"
							className="flex items-center gap-3 w-full text-left rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 p-3 border border-slate-700 hover:border-slate-650 font-medium transition-all"
						>
							<span>🏡</span>
							<span className="text-sm">Añadir Nuevo Rancho</span>
						</button>
						<button
							type="button"
							className="flex items-center gap-3 w-full text-left rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 p-3 border border-slate-700 hover:border-slate-650 font-medium transition-all"
						>
							<span>📦</span>
							<span className="text-sm">Ingreso de Insumos</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
