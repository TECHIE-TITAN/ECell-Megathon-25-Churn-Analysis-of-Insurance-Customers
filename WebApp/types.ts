import React from 'react';

export interface UserData {
  // Identifiers
  individual_id: string;
  date_of_birth: string;

  // Personal
  age_in_years: number;
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  
  // Household & Residence
  has_children: boolean;
  length_of_residence: number;
  home_owner: boolean;
  
  // Financial
  income: number;
  home_market_value: number;
  good_credit: boolean;

  // Education & Location
  college_degree: boolean;
  state: string;
  county: string;

  // Specific Location
  city: string;
  latitude: number;
  longitude: number;

  // Account History
  customer_origination_date: string; // YYYY-MM-DD
  days_tenure: number;

  // Policy Details
  current_annual_amount: number;
  account_suspension_date: string; // YYYY-MM-DD
}

export interface ChurnPrediction {
  probability: number;
  decision: 'Likely to Churn' | 'Unlikely to Churn';
}

export interface ShapFeatureContribution {
  feature: string;
  value: number;
  userValue: string | number | boolean;
}

export interface AnimatedIconProps extends React.SVGProps<SVGSVGElement> {
    clicked: boolean;
}

export interface SectorData {
  id: string;
  title:string;
  // FIX: Simplify icon type to React.FC<AnimatedIconProps> for better type safety and consistency.
  icon: React.FC<AnimatedIconProps>;
  description: string;
  pageContent: {
    heading: string;
    paragraphs: string[];
  };
}