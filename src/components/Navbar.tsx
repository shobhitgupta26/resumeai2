
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, ChevronDown } from "lucide-react";

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
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between h-16 px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <div className="text-2xl font-medium">
            <span className="text-primary">Resume</span>AI
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 text-sm">
          <div className="relative group">
            <Button variant="ghost" className="flex items-center gap-1 px-3">
              Resume <ChevronDown className="h-4 w-4" />
            </Button>
            <div className="absolute top-full left-0 transform opacity-0 scale-95 transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto">
              <div className="bg-background/95 backdrop-blur-lg shadow-lg rounded-md mt-1 p-2 w-48 border">
                <Link to="/builder" className="block px-4 py-2 rounded-md hover:bg-muted/50 transition-colors">Resume Builder</Link>
                <Link to="/templates" className="block px-4 py-2 rounded-md hover:bg-muted/50 transition-colors">Resume Templates</Link>
                <Link to="/analyzer" className="block px-4 py-2 rounded-md hover:bg-muted/50 transition-colors">Resume Analyzer</Link>
              </div>
            </div>
          </div>
          
          <Link to="/templates" className="px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">Templates</Link>
          <Link to="/pricing" className="px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">Pricing</Link>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {isLoaded && isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden md:flex"
                onClick={() => navigate("/sign-in")}
              >
                Sign in
              </Button>
              <Button 
                variant="default"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => navigate("/sign-up")}
              >
                Get Started
              </Button>
            </>
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
        <div className="fixed inset-0 top-16 bg-background/95 backdrop-blur-md z-40 md:hidden animate-fade-in">
          <nav className="flex flex-col p-6 space-y-3 text-lg">
            <div className="py-2 border-b">
              <div className="font-medium mb-2">Resume</div>
              <Link to="/builder" className="block py-2 pl-4 hover:text-primary transition-colors">Resume Builder</Link>
              <Link to="/templates" className="block py-2 pl-4 hover:text-primary transition-colors">Resume Templates</Link>
              <Link to="/analyzer" className="block py-2 pl-4 hover:text-primary transition-colors">Resume Analyzer</Link>
            </div>
            
            <Link to="/templates" className="py-2 border-b hover:text-primary transition-colors">Templates</Link>
            <Link to="/pricing" className="py-2 border-b hover:text-primary transition-colors">Pricing</Link>
            
            {!isSignedIn && (
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/sign-in")}
                >
                  Sign in
                </Button>
                <Button 
                  variant="default"
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => navigate("/sign-up")}
                >
                  Get Started
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
