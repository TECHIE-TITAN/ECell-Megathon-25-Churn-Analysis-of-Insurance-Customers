import { UserData } from './types';
import { US_STATES } from './constants/states';

// FIX: Add missing properties `individual_id`, `address_id`, and `date_of_birth` to conform to the UserData type.
export const DEFAULT_USER_DATA: UserData = {
  // Identifiers
  individual_id: 'VIRTUAL-USER',
  date_of_birth: '1989-01-01',

  // Personal
  age_in_years: 35,
  marital_status: 'Married',
  
  // Household & Residence
  has_children: true,
  length_of_residence: 5,
  home_owner: true,
  
  // Financial
  income: 80000,
  home_market_value: 250000,
  good_credit: true,

  // Education & Location
  college_degree: true,
  state: 'CA',
  county: 'Santa Clara',

  // Specific Location
  city: 'Mountain View',
  latitude: 37.3861,
  longitude: -122.0839,

  // Account History
  customer_origination_date: '2021-01-15',
  days_tenure: 1200,

  // Policy Details
  current_annual_amount: 1200,
  account_suspension_date: '',
};

export const MARITAL_STATUS_OPTIONS: UserData['marital_status'][] = ['Single', 'Married', 'Divorced', 'Widowed'];
export const BOOLEAN_OPTIONS: { label: string, value: boolean }[] = [{label: 'Yes', value: true}, {label: 'No', value: false}];
export const STATE_OPTIONS = US_STATES;