
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Legal from "@/components/Legal";
import Navbar from "@/components/Navbar";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gradient-to-b dark:from-background dark:via-muted/5 dark:to-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Legal />
      </main>
      <Footer />
    </div>
  );
}
