import type { Case, Coordinator } from "./types";

// Koordynatorzy z pliku dane_saas_mali_bracia.xlsx
export const coordinators: Coordinator[] = [
  {
    id: "coord-1",
    name: "Anna Nowak",
    email: "anna.nowak@malibracieubogich.pl",
  },
  {
    id: "coord-2",
    name: "Marek Zieliński",
    email: "marek.zielinski@malibracieubogich.pl",
  },
  {
    id: "coord-3",
    name: "Ewa Witkowska",
    email: "ewa.witkowska@malibracieubogich.pl",
  },
];

// Helper to check if a case is delayed
export function isCaseDelayed(caseItem: Case): boolean {
  if (!caseItem.nextStepDate) return false;
  if (caseItem.status === "zamknieta") return false;
  
  const nextStep = new Date(caseItem.nextStepDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return nextStep < today;
}

// Helper to check if case has no owner
export function hasNoOwner(caseItem: Case): boolean {
  return !caseItem.coordinatorId && caseItem.status !== "zamknieta";
}

// Calculate stats from cases
export function calculateStats(cases: Case[]): { open: number; urgent: number; delayed: number; newThisWeek: number } {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return {
    open: cases.filter(c => c.status !== "zamknieta").length,
    urgent: cases.filter(c => c.priority === "pilna" && c.status !== "zamknieta").length,
    delayed: cases.filter(c => isCaseDelayed(c)).length,
    newThisWeek: cases.filter(c => new Date(c.createdAt) >= oneWeekAgo).length,
  };
}

// Get coordinator by ID
export function getCoordinatorById(id: string | null): Coordinator | undefined {
  if (!id) return undefined;
  return coordinators.find(c => c.id === id);
}
