"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { NewCaseData, CaseType, CasePriority } from "@/lib/types";

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewCaseData) => void;
}

export function NewCaseDialog({ open, onOpenChange, onSubmit }: NewCaseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewCaseData>({
    title: "",
    type: "senior",
    priority: "standardowa",
    personName: "",
    personContact: "",
    region: "",
    description: "",
    nextStepDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          status: "new",
          priority: formData.priority === "pilna" ? "urgent" : formData.priority === "wysoka" ? "high" : "normal",
          related_person_name: formData.personName,
          related_person_phone: formData.personContact,
          due_date: formData.nextStepDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create case");
      }

      const newCase = await response.json();
      
      toast({
        title: "Sprawa została dodana",
        description: `Sprawa "${formData.title}" została pomyślnie utworzona.`,
      });

      // Call the original onSubmit for local state update
      onSubmit(formData);
      
      // Reset form
      setFormData({
        title: "",
        type: "senior",
        priority: "standardowa",
        personName: "",
        personContact: "",
        region: "",
        description: "",
        nextStepDate: "",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać sprawy. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.title && formData.personName && formData.region && formData.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nowa sprawa</DialogTitle>
          <DialogDescription>
            Dodaj nową sprawę do systemu. Wypełnij podstawowe informacje.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł sprawy *</Label>
            <Input
              id="title"
              placeholder="np. Wsparcie w codziennych zakupach"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Typ sprawy</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as CaseType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="wolontariusz">Wolontariusz</SelectItem>
                  <SelectItem value="dopasowanie">Dopasowanie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priorytet</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as CasePriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="pilna">Pilna</SelectItem>
                  <SelectItem value="wysoka">Wysoka</SelectItem>
                  <SelectItem value="standardowa">Standardowa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Person info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personName">Osoba powiązana *</Label>
              <Input
                id="personName"
                placeholder="Imię i nazwisko"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personContact">Kontakt</Label>
              <Input
                id="personContact"
                placeholder="Telefon lub email"
                value={formData.personContact}
                onChange={(e) => setFormData({ ...formData, personContact: e.target.value })}
              />
            </div>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Input
              id="region"
              placeholder="np. Warszawa - Mokotów"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>

          {/* Next step date */}
          <div className="space-y-2">
            <Label htmlFor="nextStepDate">Data kolejnego kroku</Label>
            <Input
              id="nextStepDate"
              type="date"
              value={formData.nextStepDate}
              onChange={(e) => setFormData({ ...formData, nextStepDate: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Opis sprawy *</Label>
            <Textarea
              id="description"
              placeholder="Opisz szczegóły sprawy..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Dodawanie..." : "Dodaj sprawę"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
