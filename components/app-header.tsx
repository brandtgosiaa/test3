"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AppHeaderProps {
  onNewCase: () => void;
}

export function AppHeader({ onNewCase }: AppHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Stowarzyszenie Mali Bracia Ubogich"
              width={180}
              height={44}
              className="object-contain"
              priority
            />
            <div className="h-6 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">Centrum Spraw</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={onNewCase} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nowa sprawa</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
