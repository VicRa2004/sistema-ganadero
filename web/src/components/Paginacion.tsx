import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginacionProps {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
}

export function Paginacion({ page, totalPages, onChange }: PaginacionProps) {
	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
			<p className="text-sm text-muted-foreground text-center sm:text-left">
				Página <span className="font-semibold text-foreground">{page}</span> de{" "}
				<span className="font-semibold text-foreground">
					{Math.max(totalPages, 1)}
				</span>
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onChange(Math.max(1, page - 1))}
					disabled={page === 1}
					className="cursor-pointer"
				>
					<ChevronLeft className="size-4" />
					Anterior
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onChange(page + 1)}
					disabled={page >= totalPages}
					className="cursor-pointer"
				>
					Siguiente
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
