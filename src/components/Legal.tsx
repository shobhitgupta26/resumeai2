
import { useEffect, useRef } from "react";

export default function Legal() {
  const legalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const legalItems = legalRef.current?.querySelectorAll(".legal-item");
    if (legalItems) {
      legalItems.forEach((el, index) => {
        // Cast el to HTMLElement to correctly use the style property
        (el as HTMLElement).style.animationDelay = `${0.15 * index}s`;
        observer.observe(el);
      });
    }

    return () => {
      if (legalItems) {
        legalItems.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  return (
    <section ref={legalRef} className="py-16 bg-muted/10">
      <div className="container max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="legal-item opacity-0">
            <h3 className="text-lg font-medium mb-4">Privacy Policy</h3>
            <p className="text-muted-foreground text-sm">
              We take your privacy seriously. Our Resume AI tool ensures your data remains protected and confidential.
            </p>
          </div>
          <div className="legal-item opacity-0">
            <h3 className="text-lg font-medium mb-4">Terms of Service</h3>
            <p className="text-muted-foreground text-sm">
              By using our service, you agree to our terms which are designed to provide the best experience for all users.
            </p>
          </div>
          <div className="legal-item opacity-0">
            <h3 className="text-lg font-medium mb-4">Cookie Policy</h3>
            <p className="text-muted-foreground text-sm">
              Our website uses cookies to enhance your browsing experience and provide personalized services.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
