import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl" : "bg-background/95"
      }`}
    >
      <nav className="flex items-center justify-between h-12 px-4 md:px-8 max-w-[1024px] mx-auto">
        <Link to="/" className="shrink-0">
          <div className="text-2xl font-medium">ResumeAI</div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 text-sm">
          <Link to="/features" className="hover:text-foreground/80 transition-colors">Features</Link>
          <Link to="/templates" className="hover:text-foreground/80 transition-colors">Templates</Link>
          <Link to="/pricing" className="hover:text-foreground/80 transition-colors">Pricing</Link>
          <Link to="/builder" className="hover:text-foreground/80 transition-colors">Builder</Link>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoaded && isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button 
              variant="ghost" 
              className="hidden md:flex hover:text-foreground/80"
              onClick={() => navigate("/sign-in")}
            >
              Sign In
            </Button>
          )}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 top-12 bg-background z-40 md:hidden animate-fade-in">
          <nav className="flex flex-col p-6 space-y-6 text-lg">
            <Link to="/features" className="hover:text-foreground/80 transition-colors">Features</Link>
            <Link to="/templates" className="hover:text-foreground/80 transition-colors">Templates</Link>
            <Link to="/pricing" className="hover:text-foreground/80 transition-colors">Pricing</Link>
            <Link to="/builder" className="hover:text-foreground/80 transition-colors">Builder</Link>
            {!isSignedIn && (
              <Button 
                variant="default"
                className="w-full"
                onClick={() => navigate("/sign-in")}
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
