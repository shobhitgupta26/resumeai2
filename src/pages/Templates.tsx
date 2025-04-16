
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Templates() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gradient-to-b dark:from-background dark:via-background/80 dark:to-background">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="py-24">
          <div className="container px-4">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center">
              Resume Templates
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Choose from our collection of professional templates
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Template placeholders */}
              <div className="aspect-[8.5/11] rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
                <div className="w-full h-full bg-muted/30 rounded" />
              </div>
              <div className="aspect-[8.5/11] rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
                <div className="w-full h-full bg-muted/30 rounded" />
              </div>
              <div className="aspect-[8.5/11] rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
                <div className="w-full h-full bg-muted/30 rounded" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
