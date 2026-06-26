/**
 * Home Page
 * =========
 * Main landing page assembling Hero, Latest Additions, and Quick Links.
 */

import HeroSection from "@/components/home/HeroSection";
import LatestAdditions from "@/components/home/LatestAdditions";
import BiographySection from "@/components/home/BiographySection";
import QuickLinks from "@/components/home/QuickLinks";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestAdditions />
      <BiographySection />
      <QuickLinks />
    </>
  );
}
