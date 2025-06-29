
import { Button } from '@/components/ui/button';
import FeaturesList from './FeaturesList';

interface PricingCardProps {
  freeForever: string;
  noHiddenFees: string;
  features: string[];
  registerNow: string;
}

const PricingCard = ({ freeForever, noHiddenFees, features, registerNow }: PricingCardProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-stocksense-blue p-8 md:p-12 animate-fade-in-up">
        {/* Free Badge */}
        <div className="text-center mb-8">
          <div className="inline-block bg-hero-gradient text-white px-8 py-3 rounded-full text-lg font-bold mb-4">
            {freeForever}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {noHiddenFees}
          </p>
        </div>

        {/* Features Grid */}
        <FeaturesList features={features} />

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            className="btn-primary text-lg px-12 py-4 font-bold transform hover:scale-105 transition-all duration-300"
            onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {registerNow}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
