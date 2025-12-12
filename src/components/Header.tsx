import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Building2, Heart, Search, LogOut, CalendarDays, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: '/search', label: 'Find Hospitals', icon: Search },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/my-bookings', label: 'My Bookings', icon: CalendarDays, authRequired: true },
    { href: '/dashboard', label: 'Hospital Portal', icon: Building2 },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-normal",
      isHomePage 
        ? "bg-transparent" 
        : "bg-card/95 backdrop-blur-md border-b border-border/50"
    )}>
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
              isHomePage ? "bg-card text-primary" : "bg-primary text-primary-foreground"
            )}>
              SH
            </div>
            <span className={cn(
              "font-display text-xl font-bold hidden sm:block",
              isHomePage ? "text-card" : "text-foreground"
            )}>
              Surgery Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks
              .filter(link => !link.authRequired || user)
              .map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isHomePage 
                    ? "text-card/80 hover:text-card" 
                    : "text-muted-foreground hover:text-foreground",
                  location.pathname === link.href && (isHomePage ? "text-card" : "text-primary")
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={isHomePage ? "outline-card" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="flex items-center gap-2 cursor-pointer">
                      <CalendarDays className="w-4 h-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant={isHomePage ? "outline-card" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to="/auth">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button 
                  variant={isHomePage ? "hero" : "default"}
                  size="sm"
                  asChild
                >
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", isHomePage && "text-card hover:bg-card/10")}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="space-y-2">
              {navLinks
                .filter(link => !link.authRequired || user)
                .map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isHomePage 
                      ? "text-card hover:bg-card/10" 
                      : "text-foreground hover:bg-muted",
                    location.pathname === link.href && "bg-primary/10 text-primary"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <hr className={cn("my-3", isHomePage ? "border-card/20" : "border-border")} />
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isHomePage 
                      ? "text-card hover:bg-card/10" 
                      : "text-foreground hover:bg-muted",
                    location.pathname === '/profile' && "bg-primary/10 text-primary"
                  )}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </Link>
              )}
              <div className="flex gap-2 px-4 mt-2">
                {user ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
