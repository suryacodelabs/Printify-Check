
import React from 'react';
import Layout from '@/components/layout/Layout';
import PricingTiers from '@/components/pricing/PricingTiers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Pricing = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/30 dark:to-background border-b">
        <div className="container py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you, with no hidden fees or complicated contracts.
          </p>
        </div>
      </div>

      <div className="container py-16">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="monthly" className="w-full mb-12">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="monthly">
              <PricingTiers />
            </TabsContent>
            
            <TabsContent value="annual">
              {/* Would show annual pricing in the real application */}
              <PricingTiers />
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>
              All plans come with a 14-day money-back guarantee. No credit card required for free tier.
            </p>
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-4 px-4 text-left">Feature</th>
                    <th className="py-4 px-4 text-center">Free</th>
                    <th className="py-4 px-4 text-center bg-brand-50 dark:bg-brand-950/20">Pro</th>
                    <th className="py-4 px-4 text-center">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-3 px-4">PDF Checks</td>
                    <td className="py-3 px-4 text-center">4 per day</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">Unlimited</td>
                    <td className="py-3 px-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Preflight Checks</td>
                    <td className="py-3 px-4 text-center">Basic</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">All 18</td>
                    <td className="py-3 px-4 text-center">All 18</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Automatic Fixes</td>
                    <td className="py-3 px-4 text-center">Basic</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">All 7</td>
                    <td className="py-3 px-4 text-center">All 7</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">OCR for Scanned PDFs</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">✓</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Redaction</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">✓</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">PDF/A-3u Export</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">✓</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Custom Reports</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">✓</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Batch Processing</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">-</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Team Collaboration</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">-</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">API Access</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">-</td>
                    <td className="py-3 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4">Support</td>
                    <td className="py-3 px-4 text-center">Email (48h)</td>
                    <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/20">Email (24h)</td>
                    <td className="py-3 px-4 text-center">Priority (12h)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-16 p-8 bg-muted rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Need something custom?</h3>
            <p className="text-muted-foreground mb-6">
              For enterprise needs or custom integration, contact us for specialized solutions.
            </p>
            <div className="flex justify-center">
              <button className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
