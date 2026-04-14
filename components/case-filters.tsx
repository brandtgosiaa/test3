"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import type { CaseFilters, CaseSort, Coordinator } from "@/lib/types";

interface CaseFiltersComponentProps {
  filters: CaseFilters;
  onFiltersChange: (filters: CaseFilters) => void;
  coordinators: Coordinator[];
}

export function CaseFiltersComponent({
  filters,
  onFiltersChange,
  coordinators,
}: CaseFiltersComponentProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj sprawy..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9 bg-card"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value as CaseFilters["status"] })
          }
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="nowa">Nowa</SelectItem>
            <SelectItem value="w-trakcie">W trakcie</SelectItem>
            <SelectItem value="oczekuje">Oczekuje</SelectItem>
            <SelectItem value="zamknieta">Zamknięta</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, priority: value as CaseFilters["priority"] })
          }
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-card">
            <SelectValue placeholder="Priorytet" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">Wszystkie priorytety</SelectItem>
            <SelectItem value="pilna">Pilna</SelectItem>
            <SelectItem value="wysoka">Wysoka</SelectItem>
            <SelectItem value="standardowa">Standardowa</SelectItem>
          </SelectContent>
        </Select>

        {/* Coordinator filter */}
        <Select
          value={filters.coordinatorId}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, coordinatorId: value })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-card">
            <SelectValue placeholder="Koordynator" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">Wszyscy koordynatorzy</SelectItem>
            <SelectItem value="unassigned">Bez przypisania</SelectItem>
            {coordinators.map((coord) => (
              <SelectItem key={coord.id} value={coord.id}>
                {coord.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, sort: value as CaseSort })
          }
        >
          <SelectTrigger className="w-full sm:w-[190px] bg-card">
            <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Sortuj" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="opoznione">Opóźnione najpierw</SelectItem>
            <SelectItem value="priorytet">Priorytet (pilne → niskie)</SelectItem>
            <SelectItem value="najnowsze">Najnowsze</SelectItem>
            <SelectItem value="najstarsze">Najstarsze</SelectItem>
            <SelectItem value="termin">Termin (najbliższy)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
