
import { Gift } from 'lucide-react';

interface PricingHeaderProps {
  title: string;
  subtitle: string;
}

const PricingHeader = ({ title, subtitle }: PricingHeaderProps) => {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center w-20 h-20 bg-hero-gradient rounded-full mx-auto mb-6 animate-pulse">
        <Gift className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
        {title}
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {subtitle}
      </p>
    </div>
  );
};

export default PricingHeader;
