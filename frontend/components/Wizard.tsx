import React, { useState } from 'react';
import { UserData } from '../types';
import { MARITAL_STATUS_OPTIONS, BOOLEAN_OPTIONS, STATE_OPTIONS } from '../constants';
import { SliderInput } from './ui/SliderInput';
import { SelectInput } from './ui/SelectInput';
import { Button } from './ui/Button';
import { RadioGroup } from './ui/RadioGroup';
import { TextInput } from './ui/TextInput';
import { DateInput } from './ui/DateInput';

interface WizardProps {
  userData: UserData;
  setUserData?: React.Dispatch<React.SetStateAction<UserData>>;
  onAnalyze?: () => void;
  isLoading?: boolean;
  isCentered?: boolean;
  readOnly?: boolean;
}

const WIZARD_STEPS = [
  { title: 'Personal Profile', fields: ['age_in_years', 'marital_status', 'date_of_birth', 'has_children'] },
  { title: 'Residence & Education', fields: ['length_of_residence', 'home_owner', 'college_degree'] },
  { title: 'Financial Profile', fields: ['income', 'home_market_value', 'good_credit'] },
  { title: 'Location Details', fields: ['state', 'county', 'city', 'latitude', 'longitude'] },
  { title: 'Account & Policy', fields: ['customer_origination_date', 'days_tenure', 'current_annual_amount', 'account_suspension_date', 'individual_id'] }
];


export const Wizard: React.FC<WizardProps> = ({ 
    userData, 
    setUserData, 
    onAnalyze, 
    isLoading, 
    isCentered = false, 
    readOnly = false 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (field: keyof UserData, value: any) => {
    if (readOnly || !setUserData) return;

    let parsedValue = value;
    if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        parsedValue = value === 'true';
    }
    setUserData(prev => prev ? ({ ...prev, [field]: parsedValue }) : null);
  };
  
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const renderField = (field: keyof UserData) => {
    switch (field) {
        // Personal
        case 'age_in_years':
            return <SliderInput label="Age" min={18} max={100} step={1} value={userData.age_in_years} onChange={(e) => handleInputChange('age_in_years', parseInt(e.target.value))} unit="years" disabled={readOnly} />;
        case 'marital_status':
            return <SelectInput label="Marital Status" value={userData.marital_status} onChange={(e) => handleInputChange('marital_status', e.target.value)} options={MARITAL_STATUS_OPTIONS.map(o => ({label: o, value: o}))} disabled={readOnly} />;
        case 'date_of_birth':
            return <DateInput label="Date of Birth" value={userData.date_of_birth} onChange={(e) => handleInputChange('date_of_birth', e.target.value)} disabled={readOnly} />;
        case 'has_children':
            return <RadioGroup label="Has Children" value={String(userData.has_children)} onChange={(val) => handleInputChange('has_children', val)} options={BOOLEAN_OPTIONS} disabled={readOnly} />;
        
        // Residence & Education
        case 'length_of_residence':
            return <SliderInput label="Length of Residence" min={0} max={50} step={1} value={userData.length_of_residence} onChange={(e) => handleInputChange('length_of_residence', parseInt(e.target.value))} unit="years" disabled={readOnly} />;
        case 'home_owner':
            return <RadioGroup label="Home Owner" value={String(userData.home_owner)} onChange={(val) => handleInputChange('home_owner', val)} options={BOOLEAN_OPTIONS} disabled={readOnly} />;
        case 'college_degree':
            return <RadioGroup label="College Degree" value={String(userData.college_degree)} onChange={(val) => handleInputChange('college_degree', val)} options={BOOLEAN_OPTIONS} disabled={readOnly} />;

        // Financials
        case 'income':
            return <SliderInput label="Annual Income" min={10000} max={500000} step={1000} value={userData.income} onChange={(e) => handleInputChange('income', parseInt(e.target.value))} unit="$" format={(val) => val.toLocaleString()} disabled={readOnly} />;
        case 'home_market_value':
            return <SliderInput label="Home Market Value" min={50000} max={2000000} step={10000} value={userData.home_market_value} onChange={(e) => handleInputChange('home_market_value', parseInt(e.target.value))} unit="$" format={(val) => val.toLocaleString()} disabled={!userData.home_owner || readOnly} />;
        case 'good_credit':
            return <RadioGroup label="Good Credit History" value={String(userData.good_credit)} onChange={(val) => handleInputChange('good_credit', val)} options={BOOLEAN_OPTIONS} disabled={readOnly} />;
        
        // Location
        case 'state':
            return <SelectInput label="State" value={userData.state} onChange={(e) => handleInputChange('state', e.target.value)} options={STATE_OPTIONS} disabled={readOnly} />;
        case 'county':
            return <TextInput label="County" value={userData.county} onChange={(e) => handleInputChange('county', e.target.value)} disabled={readOnly} />;
        case 'city':
            return <TextInput label="City" value={userData.city} onChange={(e) => handleInputChange('city', e.target.value)} disabled={readOnly} />;
        case 'latitude':
            return <TextInput label="Latitude" type="number" value={userData.latitude} onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))} disabled={readOnly} />;
        case 'longitude':
            return <TextInput label="Longitude" type="number" value={userData.longitude} onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))} disabled={readOnly} />;
        
        // Account & Policy
        case 'customer_origination_date':
            return <DateInput label="Customer Origination Date" value={userData.customer_origination_date} onChange={(e) => handleInputChange('customer_origination_date', e.target.value)} disabled={readOnly} />;
        case 'days_tenure':
            return <SliderInput label="Tenure (days)" min={0} max={10000} step={1} value={userData.days_tenure} onChange={(e) => handleInputChange('days_tenure', parseInt(e.target.value))} unit="days" disabled={readOnly} />;
        case 'individual_id':
            return <TextInput label="Customer ID" value={userData.individual_id} readOnly />;
        case 'current_annual_amount':
            return <SliderInput label="Current Annual Amount" min={100} max={10000} step={50} value={userData.current_annual_amount} onChange={(e) => handleInputChange('current_annual_amount', parseInt(e.target.value))} unit="$" format={(val) => val.toLocaleString()} disabled={readOnly} />;
        case 'account_suspension_date':
            return <DateInput label="Suspension Date (if any)" value={userData.account_suspension_date} onChange={(e) => handleInputChange('account_suspension_date', e.target.value)} disabled={readOnly} />;

        default:
            return null;
    }
  };
  
  const wrapperClass = isCentered
    ? "bg-white/60 dark:bg-gray-900/60 w-full backdrop-blur-xl p-6 border border-gray-300/50 dark:border-gray-700/50 flex flex-col rounded-xl shadow-2xl h-auto transition-colors"
    : "w-full h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 border-r border-gray-300/50 dark:border-gray-700/50 flex flex-col flex-shrink-0 transition-colors";

  return (
    <aside className={wrapperClass}>
        <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-display tracking-wide">{readOnly ? `Customer Profile: ${userData.individual_id}` : 'Customer Profile Wizard'}</h2>
            {!readOnly && (
                <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].title}</p>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                        <div 
                        className="bg-blue-500 h-1.5 rounded-full shimmer-effect" 
                        style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}>
                        </div>
                    </div>
                </>
            )}
        </div>

        <div className="space-y-6 flex-grow overflow-y-auto pr-2 -mr-2">
            {WIZARD_STEPS[currentStep].fields.map(field => (
                <div key={field}>
                    {renderField(field as keyof UserData)}
                </div>
            ))}
        </div>
        
        {!readOnly && (
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700/50 flex items-center justify-between">
                <Button onClick={handlePrev} disabled={currentStep === 0} className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">
                Previous Step
                </Button>

                {currentStep < WIZARD_STEPS.length - 1 && (
                    <Button onClick={handleNext}>
                        Next Step
                    </Button>
                )}

                {currentStep === WIZARD_STEPS.length - 1 && (
                    <Button onClick={onAnalyze} isLoading={isLoading} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze Churn Risk'}
                    </Button>
                )}
            </div>
        )}
    </aside>
  );
};