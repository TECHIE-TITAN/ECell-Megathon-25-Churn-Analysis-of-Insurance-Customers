import React from 'react';
import { UserData } from '../types';
import { BOOLEAN_OPTIONS } from '../constants';
import { SliderInput } from './ui/SliderInput';
import { RadioGroup } from './ui/RadioGroup';

interface VirtualInsurerPanelProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  isLoading: boolean;
}

export const VirtualInsurerPanel: React.FC<VirtualInsurerPanelProps> = ({ userData, setUserData, isLoading }) => {
  
  const handleInputChange = (field: keyof UserData, value: any) => {
     let parsedValue = value;
    if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        parsedValue = value === 'true';
    }
    setUserData(prev => prev ? ({ ...prev, [field]: parsedValue }) : null);
  };

  return (
    <aside className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-wide">Virtual Insurer</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Adjust key churn drivers to see real-time risk changes.</p>
        </div>

        <SliderInput
          label="Age"
          min={18}
          max={100}
          step={1}
          value={userData.age_in_years}
          onChange={(e) => handleInputChange('age_in_years', parseInt(e.target.value))}
          unit="years"
        />

        <SliderInput
          label="Annual Income"
          min={10000}
          max={500000}
          step={1000}
          value={userData.income}
          onChange={(e) => handleInputChange('income', parseInt(e.target.value))}
          unit="$"
          format={(val) => val.toLocaleString()}
        />
        
        <SliderInput
          label="Tenure (days)"
          min={0}
          max={10000}
          step={1}
          value={userData.days_tenure}
          onChange={(e) => handleInputChange('days_tenure', parseInt(e.target.value))}
          unit="days"
        />

        <RadioGroup 
            label="Good Credit History" 
            value={String(userData.good_credit)} 
            onChange={(val) => handleInputChange('good_credit', val)} 
            options={BOOLEAN_OPTIONS} 
        />
        
        <RadioGroup 
            label="Home Owner"
            value={String(userData.home_owner)}
            onChange={(val) => handleInputChange('home_owner', val)}
            options={BOOLEAN_OPTIONS}
        />

      </div>
    </aside>
  );
};