
import { Check } from 'lucide-react';

interface FeaturesListProps {
  features: string[];
}

const FeaturesList = ({ features }: FeaturesListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start">
          <Check className="w-5 h-5 text-stocksense-green flex-shrink-0 mt-0.5 ml-2 rtl:ml-0 rtl:mr-2" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
        </div>
      ))}
    </div>
  );
};

export default FeaturesList;
