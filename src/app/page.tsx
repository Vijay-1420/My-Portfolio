import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SpiderWebBackground from "@/components/SpiderWebBackground";
import CinematicIntro from "@/components/CinematicIntro";
import CustomSpiderCursor from "@/components/CustomSpiderCursor";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import JourneySection from "@/components/JourneySection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import WebTransition from "@/components/WebTransition";

export default function Home() {
  return (
    <>
      <CinematicIntro />
      <CustomSpiderCursor />
      <WebTransition />
      <SpiderWebBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <JourneySection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
