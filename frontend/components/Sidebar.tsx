import React from 'react';
import { UserData } from '../types';
// FIX: Removed GENDER_OPTIONS and SEGMENT_OPTIONS from import as they do not exist in constants.ts. Also removed unused imports.
import { SliderInput } from './ui/SliderInput';
import { Button } from './ui/Button';

interface SidebarProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ userData, setUserData, onAnalyze, isLoading }) => {
  
  const handleInputChange = (field: keyof UserData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-gray-900/50 backdrop-blur-sm p-6 border-r border-gray-700/50 overflow-y-auto flex-shrink-0">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-100">Customer Details</h2>
          <p className="text-sm text-gray-400 mt-1">Adjust the sliders to input customer data.</p>
        </div>

        {/* FIX: Corrected property 'age' to 'age_in_years' and unit. */}
        <SliderInput
          label="Age"
          min={18}
          max={100}
          step={1}
          value={userData.age_in_years}
          onChange={(e) => handleInputChange('age_in_years', parseInt(e.target.value))}
          unit="years"
        />

        {/* FIX: Removed RadioGroup for 'gender' as the 'gender' property does not exist on UserData and GENDER_OPTIONS is not defined. */}
        
        {/* FIX: Corrected property 'annualIncome' to 'income'. */}
        <SliderInput
          label="Annual Income"
          min={10000}
          max={250000}
          step={1000}
          value={userData.income}
          onChange={(e) => handleInputChange('income', parseInt(e.target.value))}
          unit="$"
          format={(val) => val.toLocaleString()}
        />

        {/* FIX: Corrected property 'tenureMonths' to 'days_tenure' and updated related props. */}
        <SliderInput
          label="Tenure (days)"
          min={0}
          max={10000}
          step={1}
          value={userData.days_tenure}
          onChange={(e) => handleInputChange('days_tenure', parseInt(e.target.value))}
          unit="days"
        />

        {/* FIX: Removed SliderInput for 'policyCount' as the 'policyCount' property does not exist on UserData. */}
        
        {/* FIX: Removed SelectInput for 'customerSegment' as the 'customerSegment' property does not exist on UserData and SEGMENT_OPTIONS is not defined. */}

        <Button onClick={onAnalyze} isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Churn Risk'}
        </Button>
      </div>
    </aside>
  );
};
