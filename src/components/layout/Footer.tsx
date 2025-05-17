
import React from 'react';
import { Link } from 'react-router-dom';
import { FilePenLine, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <FilePenLine size={24} className="text-brand-600" />
            <span className="text-xl font-bold">Printify Check</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            Free, open-source PDF preflight with OCR, redaction, and smart fixes. Print perfect, every time!
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a
              href="https://github.com/printifycheck/printify-check"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-brand-600 transition-colors"
              aria-label="GitHub repository"
            >
              <Github size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Product</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/features" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/source" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                Source Code
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">Resources</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/community" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                Community
              </Link>
            </li>
            <li>
              <Link to="/guides" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                Guides
              </Link>
            </li>
            <li>
              <Link to="/api" className="text-sm text-muted-foreground hover:text-brand-600 transition-colors">
                API (Team)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mt-12 pt-6 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Printify Check. Released under AGPL License.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-brand-600 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-brand-600 transition-colors">
              Privacy
            </Link>
            <Link to="/source" className="text-xs text-muted-foreground hover:text-brand-600 transition-colors">
              Source Code
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
