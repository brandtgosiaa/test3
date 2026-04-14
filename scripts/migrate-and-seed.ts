/**
 * migrate-and-seed.ts
 * Tworzy tabelę cases w Supabase i importuje dane demo z CSV.
 * Uruchom: npx tsx scripts/migrate-and-seed.ts
 * Wymaga SUPABASE_SERVICE_ROLE_KEY w .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// ── 1. Migracja ──────────────────────────────────────────────────────────────

const migrationSQL = fs.readFileSync(
  path.join(process.cwd(), "scripts/001_create_cases_table.sql"),
  "utf-8"
);

async function runMigration() {
  console.log("→ Wykonuję migrację...");
  const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL }).single();
  // exec_sql może nie istnieć — używamy bezpośrednio REST SQL endpoint
  if (error) {
    // Fallback: Supabase Management API /rest/v1/sql (tylko dla service_role)
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });
    if (!res.ok) {
      const text = await res.text();
      // Jeśli tabela już istnieje — OK
      if (text.includes("already exists")) {
        console.log("  Tabela już istnieje — pomijam.");
      } else {
        console.error("  Błąd migracji:", text);
        console.log("\n⚠️  Uruchom migrację ręcznie w Supabase Dashboard → SQL Editor:");
        console.log("  scripts/001_create_cases_table.sql\n");
      }
    } else {
      console.log("  ✓ Migracja wykonana.");
    }
  } else {
    console.log("  ✓ Migracja wykonana.");
  }
}

// ── 2. Dane demo ─────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const tomorrow = new Date(Date.now() + 86400000).toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString();
const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();

const seedData = [
  {
    title: "Helena K. — brak kontaktu od 22 dni",
    type: "senior",
    status: "risk",
    priority: "wysoki",
    coordinator_name: "Anna Nowak",
    related_person_name: "Helena K.",
    related_person_phone: "+48 601 111 222",
    description: "Senior objęty wsparciem ale bez potwierdzonego kontaktu od 22 dni.",
    operational_note: "Ostatni kontakt: wizyta domowa. Wolontariusz zgłosił trudności z dodzwonieniem się.",
    due_date: yesterday,
    created_at: tenDaysAgo,
    updated_at: threeDaysAgo,
  },
  {
    title: "Jerzy M. — oczekuje na przypisanie wolontariusza",
    type: "senior",
    status: "ready",
    priority: "wysoki",
    coordinator_name: "Marek Zieliński",
    related_person_name: "Jerzy M.",
    related_person_phone: "+48 602 333 444",
    description: "Senior po kwalifikacji czeka ponad miesiąc na przypisanie. Region Poznań.",
    operational_note: "Preferencje: kontakt telefoniczny, wolontariusz z okolicy Jeżyc.",
    due_date: inThreeDays,
    created_at: new Date(Date.now() - 34 * 86400000).toISOString(),
    updated_at: yesterday,
  },
  {
    title: "Alicja R. — wolontariuszka bez przypisania",
    type: "wolontariusz",
    status: "ready",
    priority: "wysoki",
    coordinator_name: "Anna Nowak",
    related_person_name: "Alicja R.",
    related_person_phone: "+48 503 555 666",
    description: "Wolontariuszka po szkoleniu, nadal bez przypisania. Dostępna od pon–pt.",
    operational_note: "Przeszła pełny onboarding. Preferuje seniorów z Mokotowa.",
    due_date: tomorrow,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: yesterday,
  },
  {
    title: "Piotr S. — wolontariusz zawieszony",
    type: "wolontariusz",
    status: "paused",
    priority: "sredni",
    coordinator_name: "Ewa Witkowska",
    related_person_name: "Piotr S.",
    related_person_phone: "+48 504 777 888",
    description: "Wolontariusz czasowo wstrzymany z powodów zdrowotnych.",
    operational_note: "Planowany powrót za ~3 tygodnie. Kontakt mailowy.",
    due_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: now,
  },
  {
    title: "Relacja Helena K. – Tomasz L. — wymaga interwencji",
    type: "dopasowanie",
    status: "risk",
    priority: "wysoki",
    coordinator_name: "Anna Nowak",
    related_person_name: "Helena K.",
    related_person_phone: "+48 601 111 222",
    description: "Relacja trwa 68 dni, wymaga interwencji po przerwanym kontakcie.",
    operational_note: "Wolontariusz Tomasz L. nie odbiera. Koordynator podjął próbę kontaktu bezpośredniego.",
    due_date: yesterday,
    created_at: new Date(Date.now() - 68 * 86400000).toISOString(),
    updated_at: threeDaysAgo,
  },
  {
    title: "Propozycja dopasowania: Janina P. – Alicja R.",
    type: "dopasowanie",
    status: "proposed",
    priority: "sredni",
    coordinator_name: "Anna Nowak",
    related_person_name: "Janina P.",
    related_person_phone: "+48 605 999 000",
    description: "Nowa propozycja dopasowania wg lokalizacji i dostępności. Ocena 87%.",
    operational_note: "Obydwie strony w Warszawie, Mokotów. Czeka na akceptację koordynatora.",
    due_date: inThreeDays,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: now,
  },
];

async function runSeed() {
  console.log("→ Importuję dane demo...");
  const { data, error } = await supabase.from("cases").insert(seedData).select("id, title");

  if (error) {
    console.error("  Błąd importu:", error.message);
    return;
  }

  console.log(`  ✓ Zaimportowano ${data.length} rekordów:`);
  data.forEach((r: { id: string; title: string }) =>
    console.log(`    - [${r.id.slice(0, 8)}] ${r.title}`)
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  await runMigration();
  await runSeed();
  console.log("\n✅ Gotowe. Odśwież http://localhost:3000");
})();
