import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background/90">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-lg text-primary-foreground">
                SH
              </div>
              <span className="font-display text-xl font-bold text-background">Surgery Hub</span>
            </Link>
            <p className="text-sm text-background/70 leading-relaxed">
              Karnataka's trusted platform for finding the right surgery at the right hospital. Compare costs, read reviews, and book consultations.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Find Hospitals', href: '/search' },
                { label: 'Compare Costs', href: '/search' },
                { label: 'For Hospitals', href: '/dashboard' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Surgery Types */}
          <div>
            <h4 className="font-semibold text-background mb-4">Surgery Types</h4>
            <ul className="space-y-2">
              {[
                { label: 'Diagnostic Surgery', type: 'diagnostic' },
                { label: 'Curative Surgery', type: 'curative' },
                { label: 'Reconstructive Surgery', type: 'reconstructive' },
                { label: 'Cosmetic Surgery', type: 'cosmetic' },
                { label: 'Palliative Surgery', type: 'palliative' },
              ].map((item) => (
                <li key={item.type}>
                  <Link
                    to={`/search?surgeryType=${item.type}`}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-background/70">
                  123 Healthcare Avenue, Bengaluru, Karnataka 560001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+918001234567" className="text-sm text-background/70 hover:text-primary transition-colors">
                  +91 800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:info@surgeryhub.in" className="text-sm text-background/70 hover:text-primary transition-colors">
                  info@surgeryhub.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {currentYear} Surgery Hub. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-background/50 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-background/50 hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
