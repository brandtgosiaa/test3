// Case status options
export type CaseStatus = "nowa" | "w-trakcie" | "oczekuje" | "zamknieta";

// Case priority options
export type CasePriority = "pilna" | "wysoka" | "standardowa";

// Case type - who the case relates to
export type CaseType = "senior" | "wolontariusz" | "dopasowanie";

// Coordinator/user type
export interface Coordinator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Main Case type
export interface Case {
  id: string;
  title: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  coordinatorId: string | null;
  personName: string;
  personContact?: string;
  region: string;
  description: string;
  operationalNote?: string;
  lastContactDate: string | null;
  nextStepDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// For creating new cases
export interface NewCaseData {
  title: string;
  type: CaseType;
  priority: CasePriority;
  personName: string;
  personContact?: string;
  region: string;
  description: string;
  nextStepDate?: string;
}

// Sort options
export type CaseSort = "opoznione" | "priorytet" | "najnowsze" | "najstarsze" | "termin";

// Filter state
export interface CaseFilters {
  status: CaseStatus | "all";
  priority: CasePriority | "all";
  coordinatorId: string | "all";
  search: string;
  sort: CaseSort;
}

// KPI stats
export interface CaseStats {
  open: number;
  urgent: number;
  delayed: number;
  newThisWeek: number;
}

// Status display config
export const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string }> = {
  nowa: { label: "Nowa", color: "bg-info/15 text-info-foreground border-info/30" },
  "w-trakcie": { label: "W trakcie", color: "bg-success/15 text-success-foreground border-success/30" },
  oczekuje: { label: "Oczekuje", color: "bg-warning/15 text-warning-foreground border-warning/30" },
  zamknieta: { label: "Zamknięta", color: "bg-muted text-muted-foreground border-muted" },
};

// Priority display config
export const PRIORITY_CONFIG: Record<CasePriority, { label: string; color: string }> = {
  pilna: { label: "Pilna", color: "bg-destructive/15 text-destructive border-destructive/30" },
  wysoka: { label: "Wysoka", color: "bg-warning/15 text-warning-foreground border-warning/30" },
  standardowa: { label: "Standardowa", color: "bg-secondary text-secondary-foreground border-secondary" },
};

// Case type display config
export const CASE_TYPE_CONFIG: Record<CaseType, { label: string; icon: string }> = {
  senior: { label: "Senior", icon: "user" },
  wolontariusz: { label: "Wolontariusz", icon: "heart" },
  dopasowanie: { label: "Dopasowanie", icon: "users" },
};
