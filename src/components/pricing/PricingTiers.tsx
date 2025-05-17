
import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTierProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular?: boolean;
  onSelectPlan: () => void;
}

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  popular = false,
  onSelectPlan,
}) => {
  return (
    <Card className={`tier-card ${popular ? 'highlight' : ''}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground ml-1">/{period}</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSelectPlan} 
          className="w-full" 
          variant={popular ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const PricingTiers: React.FC = () => {
  const handleSelectPlan = (plan: string) => {
    console.log(`Selected plan: ${plan}`);
    // This would integrate with Stripe in the real implementation
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <PricingTier
        name="Free"
        price="$0"
        period="forever"
        description="Perfect for occasional use and testing."
        features={[
          { name: '4 PDF checks per day', included: true },
          { name: 'Basic preflight checks', included: true },
          { name: 'PDF viewing and annotations', included: true },
          { name: 'Standard reports', included: true },
          { name: 'OCR for scanned PDFs', included: false },
          { name: 'Redaction capabilities', included: false },
          { name: 'Unlimited checks', included: false },
          { name: 'PDF/A-3u export', included: false },
        ]}
        buttonText="Get Started"
        onSelectPlan={() => handleSelectPlan('free')}
      />
      
      <PricingTier
        name="Pro"
        price="$10"
        period="month"
        description="For individuals and small teams."
        features={[
          { name: 'Unlimited PDF checks', included: true },
          { name: 'All preflight checks', included: true },
          { name: 'OCR for scanned PDFs', included: true },
          { name: 'Redaction capabilities', included: true },
          { name: 'PDF/A-3u export', included: true },
          { name: 'Custom reports', included: true },
          { name: 'Priority email support', included: true },
          { name: 'API access', included: false },
        ]}
        buttonText="Subscribe to Pro"
        popular={true}
        onSelectPlan={() => handleSelectPlan('pro')}
      />
      
      <PricingTier
        name="Team"
        price="$69"
        period="month"
        description="For businesses with advanced needs."
        features={[
          { name: 'Everything in Pro', included: true },
          { name: 'Batch processing', included: true },
          { name: 'Advanced analytics', included: true },
          { name: 'Team collaboration', included: true },
          { name: 'API access', included: true },
          { name: 'Custom templates', included: true },
          { name: 'Priority support', included: true },
          { name: 'Custom onboarding', included: true },
        ]}
        buttonText="Subscribe to Team"
        onSelectPlan={() => handleSelectPlan('team')}
      />
    </div>
  );
};

export default PricingTiers;
