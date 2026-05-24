export type Snake = {
  id: string;
  owner_id: string;
  team_id: string;
  facility_id: string | null;
  sticker_qr: string | null;
  species_id: string | null;
  name: string;
  species: string;
  morph: string | null;
  sex: 'M' | 'F' | '' | null;
  hatch_date: string | null;
  acquired_date: string | null;
  source: string | null;
  prey_type: string;
  prey_size: string;
  feed_interval_days: number;
  photo_url: string | null;
  notes: string | null;
  archived: boolean;
  sold_at: string | null;
  sold_price: number | null;
  sold_to: string | null;
  sold_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Species = {
  id: string;
  common_name: string;
  scientific_name: string;
  category: 'snake' | 'lizard' | 'gecko' | 'tortoise' | 'other';
  origin: string | null;
  adult_size: string | null;
  lifespan: string | null;
  temp_basking: string | null;
  temp_warm: string | null;
  temp_cool: string | null;
  temp_night: string | null;
  humidity: string | null;
  enclosure_size: string | null;
  substrate: string | null;
  lighting: string | null;
  diet: string | null;
  feeding_schedule: string | null;
  prey_size_guide: string | null;
  handling: string | null;
  temperament: string | null;
  health_notes: string | null;
  common_issues: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  notes: string | null;
};

export type Sticker = {
  qr_code: string;
  owner_id: string;
  team_id: string;
  snake_id: string | null;
  claimed_at: string | null;
  created_at: string;
};

export type Feeding = {
  id: string;
  snake_id: string;
  owner_id: string;
  team_id: string;
  logged_by: string | null;
  date: string;
  prey_type: string | null;
  prey_size: string | null;
  accepted: boolean;
  regurgitated: boolean;
  next_due: string | null;
  notes: string | null;
  created_at: string;
};

export type WeightLog = {
  id: string;
  snake_id: string;
  owner_id: string;
  team_id: string;
  logged_by: string | null;
  date: string;
  grams: number;
  condition: string | null;
  notes: string | null;
  created_at: string;
};

export type Pairing = {
  id: string;
  owner_id: string;
  team_id: string;
  male_id: string;
  female_id: string;
  date: string;
  lock_observed: boolean;
  lock_duration_minutes: number | null;
  expected_ovulation: string | null;
  expected_lay_date: string | null;
  notes: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

export type Team = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'staff';
  created_at: string;
  profile?: Profile;
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  role: 'staff';
  invited_by: string | null;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type Facility = {
  id: string;
  team_id: string;
  name: string;
  display_order: number;
  created_at: string;
};

export type AppContext = {
  userId: string;
  email: string;
  team: Team;
  role: 'owner' | 'staff';
  facilities: Facility[];
};
