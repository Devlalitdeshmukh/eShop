import React, { useState } from 'react';
import { Sparkles, ChefHat, Loader } from 'lucide-react';
import { getRecipeSuggestions } from '../services/geminiService';

interface Props {
  productName: string;
}

const GeminiChef: React.FC<Props> = ({ productName }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAskChef = async () => {
    setLoading(true);
    setIsOpen(true);
    const result = await getRecipeSuggestions(productName);
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <ChefHat className="w-6 h-6 text-brand-600" />
            AI Kitchen Companion
          </h3>
          <p className="text-sm text-gray-600 mt-1">Not sure how to eat this? Ask our AI Chef for creative ideas!</p>
        </div>
        <button 
          onClick={handleAskChef}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-brand-200 text-brand-700 px-4 py-2 rounded-lg font-medium hover:bg-brand-100 transition-colors shadow-sm"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Asking Chef...' : 'Get Ideas'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-brand-200 animate-fade-in">
           {loading && !suggestion ? (
             <div className="flex flex-col items-center justify-center py-4 text-brand-400">
               <Loader className="w-8 h-8 animate-spin mb-2" />
               <p className="text-sm">Thinking of delicious recipes...</p>
             </div>
           ) : (
             <div className="prose prose-sm text-gray-700">
               <p className="font-medium mb-2">Here are some suggestions for {productName}:</p>
               <div className="whitespace-pre-line bg-white p-4 rounded-xl border border-brand-100">
                  {suggestion}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default GeminiChef;