import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Steps } from "@/components/home/steps";
import { Features } from "@/components/home/features";
import { MatchedPrograms } from "@/components/home/matched-programs";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { Trust } from "@/components/home/trust";
import { FinalCTA } from "@/components/home/final-cta";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <Hero />
      <Steps />
      <Features />
      <MatchedPrograms />
      <DashboardPreview />
      <Trust />
      <FinalCTA />
      <Footer />
    </main>
  );
}
