"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { KpiCards } from "@/components/kpi-cards";
import { CaseFiltersComponent } from "@/components/case-filters";
import { CasesList } from "@/components/cases-list";
import { NewCaseDialog } from "@/components/new-case-dialog";
import { AssignCoordinatorDialog } from "@/components/assign-coordinator-dialog";
import { coordinators, calculateStats, isCaseDelayed } from "@/lib/demo-data";
import type { Case, CaseFilters, CaseSort, CaseStatus, NewCaseData } from "@/lib/types";

// Map Supabase snake_case response to app Case type
function mapApiCase(r: Record<string, unknown>): Case {
  const priorityMap: Record<string, Case["priority"]> = {
    urgent: "pilna", pilna: "pilna", wysoki: "pilna",
    high: "wysoka", wysoka: "wysoka", sredni: "wysoka",
    normal: "standardowa", standardowa: "standardowa", niski: "standardowa",
  };
  const statusMap: Record<string, Case["status"]> = {
    new: "nowa", nowa: "nowa",
    "in-progress": "w-trakcie", "w-trakcie": "w-trakcie", ready: "w-trakcie", proposed: "w-trakcie",
    waiting: "oczekuje", oczekuje: "oczekuje", paused: "oczekuje", risk: "oczekuje",
    closed: "zamknieta", zamknieta: "zamknieta",
  };
  return {
    id: r.id as string,
    title: r.title as string,
    type: (r.type as Case["type"]) ?? "senior",
    status: statusMap[r.status as string] ?? "nowa",
    priority: priorityMap[r.priority as string] ?? "standardowa",
    coordinatorId: (r.coordinator_id as string) ?? null,
    personName: (r.related_person_name as string) ?? "",
    personContact: (r.related_person_phone as string) ?? "",
    region: (r.region as string) ?? "",
    description: (r.description as string) ?? "",
    operationalNote: (r.operational_note as string) ?? "",
    lastContactDate: null,
    nextStepDate: r.due_date ? (r.due_date as string).split("T")[0] : null,
    createdAt: (r.created_at as string)?.split("T")[0] ?? "",
    updatedAt: (r.updated_at as string)?.split("T")[0] ?? "",
  };
}

export default function CentrumSpraw() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data.map(mapApiCase));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);
  const [filters, setFilters] = useState<CaseFilters>({
    status: "all",
    priority: "all",
    coordinatorId: "all",
    search: "",
    sort: "opoznione",
  });
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [assigningCaseId, setAssigningCaseId] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => calculateStats(cases), [cases]);

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        // Status filter
        if (filters.status !== "all" && c.status !== filters.status) return false;
        
        // Priority filter
        if (filters.priority !== "all" && c.priority !== filters.priority) return false;
        
        // Coordinator filter
        if (filters.coordinatorId === "unassigned" && c.coordinatorId !== null) return false;
        if (filters.coordinatorId !== "all" && filters.coordinatorId !== "unassigned" && c.coordinatorId !== filters.coordinatorId) return false;
        
        // Search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          return (
            c.title.toLowerCase().includes(search) ||
            c.personName.toLowerCase().includes(search) ||
            c.region.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { pilna: 0, wysoka: 1, standardowa: 2 };
        switch (filters.sort) {
          case "opoznione": {
            const aD = isCaseDelayed(a) ? 0 : 1;
            const bD = isCaseDelayed(b) ? 0 : 1;
            if (aD !== bD) return aD - bD;
            return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
          }
          case "priorytet":
            return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
          case "najnowsze":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "najstarsze":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "termin": {
            if (!a.nextStepDate && !b.nextStepDate) return 0;
            if (!a.nextStepDate) return 1;
            if (!b.nextStepDate) return -1;
            return new Date(a.nextStepDate).getTime() - new Date(b.nextStepDate).getTime();
          }
          default:
            return 0;
        }
      });
  }, [cases, filters]);

  // Handle status change
  const handleStatusChange = (caseId: string, status: CaseStatus) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, status, updatedAt: new Date().toISOString().split("T")[0] }
          : c
      )
    );
  };

  // Handle coordinator assignment
  const handleAssignCoordinator = (caseId: string, coordinatorId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, coordinatorId, updatedAt: new Date().toISOString().split("T")[0] }
          : c
      )
    );
    setAssigningCaseId(null);
  };

  // Handle new case — re-fetch from API after dialog saves to Supabase
  const handleNewCase = (_data: NewCaseData) => {
    fetchCases();
    setIsNewCaseOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onNewCase={() => setIsNewCaseOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Section */}
        <section className="mb-8">
          <KpiCards {...stats} />
        </section>

        {/* Filters Section */}
        <section className="mb-6">
          <CaseFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            coordinators={coordinators}
          />
        </section>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Ładowanie spraw..."
              : `Wyświetlanie ${filteredCases.length} z ${cases.length} spraw`}
          </p>
        </div>

        {/* Cases List */}
        <section>
          <CasesList
            cases={filteredCases}
            coordinators={coordinators}
            onStatusChange={handleStatusChange}
            onAssignCoordinator={(caseId) => setAssigningCaseId(caseId)}
          />
        </section>
      </main>

      {/* New Case Dialog */}
      <NewCaseDialog
        open={isNewCaseOpen}
        onOpenChange={setIsNewCaseOpen}
        onSubmit={handleNewCase}
      />

      {/* Assign Coordinator Dialog */}
      <AssignCoordinatorDialog
        open={!!assigningCaseId}
        onOpenChange={(open) => !open && setAssigningCaseId(null)}
        coordinators={coordinators}
        onAssign={(coordinatorId) => {
          if (assigningCaseId) {
            handleAssignCoordinator(assigningCaseId, coordinatorId);
          }
        }}
      />
    </div>
  );
}
