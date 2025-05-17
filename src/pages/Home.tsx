
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileCheck, Shield, Zap, Table } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Professional PDF Preflighting for Print Production
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Ensure your PDFs are print-ready with our advanced preflighting tool. Detect and fix issues before they become costly printing mistakes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to={user ? "/dashboard" : "/auth"}>
                    {user ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 border">
                <div className="flex items-center justify-center mb-4">
                  <FileCheck className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-center mb-4">
                  PDF Preflight Check
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  Drop your PDF file here to get an instant analysis
                </p>
                <Button asChild className="w-full">
                  <Link to={user ? "/dashboard" : "/auth"}>
                    {user ? "Upload PDF" : "Sign in to Start"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Preflight Tools
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Check</h3>
              <p className="text-muted-foreground">
                Analyze image resolution, color spaces, fonts, and transparencies to ensure optimal print quality.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Redaction Tools</h3>
              <p className="text-muted-foreground">
                Remove sensitive information and metadata from your documents before sharing them.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Auto-Fix</h3>
              <p className="text-muted-foreground">
                Automatically repair common issues like missing bleed, incorrect color modes, and incomplete metadata.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/competitor-analysis">
                <Table className="h-4 w-4" />
                See How We Compare in 2025
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Checking Your PDFs Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of designers and print professionals who trust our tools for perfect print production.
          </p>
          <Button asChild size="lg">
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? "Go to Dashboard" : "Create Free Account"}
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
