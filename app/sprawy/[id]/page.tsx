"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Heart,
  Users,
  Calendar,
  MapPin,
  Phone,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare,
  Save,
} from "lucide-react";
import { coordinators, isCaseDelayed } from "@/lib/demo-data";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/types";
import type { Case, CaseStatus, CasePriority } from "@/lib/types";

const typeIcons = {
  senior: User,
  wolontariusz: Heart,
  dopasowanie: Users,
};

const typeLabels: Record<string, string> = {
  senior: "Senior",
  wolontariusz: "Wolontariusz",
  dopasowanie: "Dopasowanie",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Brak daty";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CaseStatus>("nowa");
  const [priority, setPriority] = useState<CasePriority>("standardowa");
  const [coordinatorId, setCoordinatorId] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const mapped = mapApiCase(data);
        setCaseItem(mapped);
        setStatus(mapped.status);
        setPriority(mapped.priority);
        setCoordinatorId(mapped.coordinatorId ?? "");
        setNote(mapped.operationalNote ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        priority,
        coordinator_id: coordinatorId || null,
        coordinator_name: coordinators.find((c) => c.id === coordinatorId)?.name ?? null,
        operational_note: note,
      }),
    });
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Ładowanie sprawy...</p>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Sprawa nie znaleziona</h1>
          <p className="text-muted-foreground mb-4">Nie znaleziono sprawy o podanym identyfikatorze.</p>
          <Button asChild>
            <Link href="/">Wróć do listy spraw</Link>
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[caseItem.type] ?? User;
  const coordinator = coordinators.find((c) => c.id === coordinatorId);
  const isDelayed = isCaseDelayed(caseItem);
  const statusConfig = STATUS_CONFIG[status];
  const priorityConfig = PRIORITY_CONFIG[priority];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">{caseItem.title}</h1>
              <p className="text-sm text-muted-foreground">
                {typeLabels[caseItem.type]} • {caseItem.region}
              </p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for delayed cases */}
        {isDelayed && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Ta sprawa jest opóźniona</p>
              <p className="text-sm text-muted-foreground mt-1">
                Termin kolejnego kroku minął {formatDate(caseItem.nextStepDate)}. Sprawdź aktualną sytuację i zaktualizuj plan działania.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-muted">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  Informacje o sprawie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tytuł</h3>
                  <p className="text-lg">{caseItem.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Opis</h3>
                  <p className="text-foreground/80 leading-relaxed">{caseItem.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Osoba powiązana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Imię i nazwisko</p>
                      <p className="font-medium">{caseItem.personName}</p>
                    </div>
                  </div>
                  {caseItem.personContact && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kontakt</p>
                        <p className="font-medium">{caseItem.personContact}</p>
                      </div>
                    </div>
                  )}
                  {caseItem.region && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Region</p>
                        <p className="font-medium">{caseItem.region}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Notatka operacyjna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Dodaj notatkę operacyjną dotyczącą tej sprawy..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Notatka widoczna dla wszystkich koordynatorów
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Status sprawy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as CaseStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectItem value="nowa">Nowa</SelectItem>
                      <SelectItem value="w-trakcie">W trakcie</SelectItem>
                      <SelectItem value="oczekuje">Oczekuje</SelectItem>
                      <SelectItem value="zamknieta">Zamknięta</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className={`mt-2 ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Priorytet</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as CasePriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectItem value="pilna">Pilna</SelectItem>
                      <SelectItem value="wysoka">Wysoka</SelectItem>
                      <SelectItem value="standardowa">Standardowa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className={`mt-2 ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Koordynator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={coordinatorId} onValueChange={setCoordinatorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz koordynatora" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    {coordinators.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {coordinator && (
                  <div className="mt-3 p-3 rounded-lg bg-muted flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {coordinator.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{coordinator.name}</p>
                      <p className="text-sm text-muted-foreground">{coordinator.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Terminy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ostatni kontakt</p>
                    <p className="font-medium">{formatDate(caseItem.lastContactDate)}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isDelayed ? "text-destructive" : ""}`}>
                  <div className={`p-2 rounded-lg ${isDelayed ? "bg-destructive/10" : "bg-muted"}`}>
                    <Calendar className={`h-4 w-4 ${isDelayed ? "text-destructive" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDelayed ? "text-destructive/80" : "text-muted-foreground"}`}>
                      Kolejny krok
                    </p>
                    <p className="font-medium">{formatDate(caseItem.nextStepDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Utworzono</p>
                    <p className="text-sm">{formatDate(caseItem.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
