import React, { useState, useEffect, useRef } from 'react';
import { UserData, ChurnPrediction, ShapFeatureContribution } from '../types';
import { Wizard } from './Wizard';
import { MainContent } from './MainContent';
import { Button } from './ui/Button';
import { VirtualInsurerPanel } from './VirtualInsurerPanel';
import { simulateCustomerChanges } from '../services/predictionService';

interface CustomerResultsPageProps {
    userData: UserData;
    prediction: ChurnPrediction;
    shapExplanation: ShapFeatureContribution[];
    onSearchAgain: () => void;
}

export const CustomerResultsPage: React.FC<CustomerResultsPageProps> = ({
    userData,
    prediction,
    shapExplanation,
    onSearchAgain
}) => {
    const [isVirtualMode, setIsVirtualMode] = useState(false);
    const [virtualUserData, setVirtualUserData] = useState<UserData | null>(null);
    const [virtualPrediction, setVirtualPrediction] = useState<ChurnPrediction | null>(null);
    const [virtualShapExplanation, setVirtualShapExplanation] = useState<ShapFeatureContribution[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const analysisTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isVirtualMode || !virtualUserData) return;

        if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current);
        }
        
        setIsAnalyzing(true);
        analysisTimeoutRef.current = window.setTimeout(async () => {
            try {
                // Use new simulateCustomerChanges that calls Flask API with SHAP analysis
                const { prediction, shapExplanation } = await simulateCustomerChanges(virtualUserData);
                
                setVirtualPrediction(prediction);
                setVirtualShapExplanation(shapExplanation);
                setIsAnalyzing(false);
            } catch (error) {
                console.error('Simulation error:', error);
                setIsAnalyzing(false);
            }
        }, 500); // 500ms debounce

        return () => {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
        };
    }, [isVirtualMode, virtualUserData]);

    const handleEnterVirtualMode = () => {
        setVirtualUserData(userData);
        setVirtualPrediction(prediction);
        setVirtualShapExplanation(shapExplanation);
        setIsVirtualMode(true);
    };

    const handleExitVirtualMode = () => {
        setIsVirtualMode(false);
    };

    if (isVirtualMode && virtualUserData) {
        return (
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Left side: Original Data (Read-only) */}
                <div className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0 h-full overflow-y-auto">
                    <Wizard
                        userData={userData}
                        readOnly={true}
                    />
                </div>

                {/* Right side: Virtual Insurer */}
                <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-slate-950/50">
                    <VirtualInsurerPanel 
                        userData={virtualUserData}
                        setUserData={setVirtualUserData}
                        isLoading={isAnalyzing}
                    />
                     <MainContent
                        prediction={virtualPrediction}
                        shapExplanation={virtualShapExplanation}
                        isLoading={isAnalyzing}
                        hasAnalyzed={true}
                    />
                    <div className="px-6 lg:px-8 py-4 border-t border-gray-300/50 dark:border-gray-700/50 text-center flex-shrink-0">
                        <Button onClick={handleExitVirtualMode}>
                            Close Simulator
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0 h-full overflow-y-auto">
                <Wizard
                    userData={userData}
                    readOnly={true}
                />
            </div>
            
            <div className="flex-grow flex flex-col overflow-y-auto">
                 <MainContent
                    prediction={prediction}
                    shapExplanation={shapExplanation}
                    isLoading={false}
                    hasAnalyzed={true}
                />
                <div className="px-6 lg:px-8 py-6 text-center flex items-center justify-center gap-4 flex-shrink-0">
                    <Button onClick={onSearchAgain} className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">
                        &larr; Search Again
                    </Button>
                    <Button onClick={handleEnterVirtualMode}>
                        Simulate Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};