import { createFileRoute } from "@tanstack/react-router";
import { AmbientBackground } from "@/components/fx/AmbientBackground";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/components/hero/Hero";
import { DepartmentExplorer } from "@/components/sections/DepartmentExplorer";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { CallToAction } from "@/components/sections/CallToAction";

const title = "VIT Bhopal AI Student Assistant";
const description =
  "A citation-grounded AI operating system for VIT Bhopal — answering academics, exams, hostel, library, placement and student service queries in seconds.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground dense />
      <SiteHeader />
      <main>
        <Hero />
        <DepartmentExplorer />
        <DashboardPreview />
        <CallToAction />
      </main>
    </div>
  );
}
