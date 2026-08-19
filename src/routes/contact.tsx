import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & bookings — TasteHub Restaurant" },
      {
        name: "description",
        content:
          "Find TasteHub Restaurant on Harvest Lane, Riverside. Opening hours, phone, email and a message form for bookings.",
      },
      { property: "og:title", content: "Contact & bookings — TasteHub Restaurant" },
      { property: "og:description", content: "Address, opening hours and how to reach the team." },
    ],
  }),
  component: ContactPage,
});

const details = [
  { icon: MapPin, label: "Address", value: "Harare,Zimbabwe" },
  { icon: Phone, label: "Phone", value: "+263718676637" },
  { icon: Mail, label: "Email", value: "tawananyashachipata@gmail.com" },
  { icon: Clock, label: "Hours", value: "Mon–Thu 11:00–22:00 · Fri–Sun 11:00–23:30" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Say hello</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-muted-foreground">
            Questions about a booking, a large table or an allergy? Drop us a line and the team will
            come back to you the same day.
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            {details.map((d) => (
              <div key={d.label} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <d.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="space-y-4 rounded-2xl border border-border bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Thanks! We'll be in touch shortly.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" required placeholder="Alex Morgan" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" required placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" required rows={6} placeholder="How can we help?" />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Send message
            </Button>
            {sent && (
              <p className="text-sm text-muted-foreground">
                Message received — we reply to every enquiry within one business day.
              </p>
            )}
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}
