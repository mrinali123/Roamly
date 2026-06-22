export interface Profile {
  id: string;
  full_name: string;
  email: string;
  home_city?: string;
  default_budget?: string;
  default_interests?: string[];
  default_dietary?: string[];
  preferred_currency?: string;
  created_at: string;
}
