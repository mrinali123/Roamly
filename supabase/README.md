# Database Schema

Run `schema.sql` in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).

## Tables

### `profiles`
Auto-created for every new user via a trigger on `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, references `auth.users` |
| `full_name` | text | |
| `email` | text | |
| `home_city` | text | optional |
| `default_budget` | text | optional |
| `default_interests` | text[] | optional |
| `default_dietary` | text[] | optional |
| `created_at` | timestamptz | |

### `trips`
One row per generated itinerary.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users` |
| `destination` | text | |
| `trip_title` | text | AI-generated |
| `arrival_date` | date | |
| `departure_date` | date | |
| `hotel_name` | text | |
| `hotel_address` | text | optional |
| `num_travelers` | int | |
| `trip_purpose` | text | |
| `budget_level` | text | |
| `pace` | text | |
| `interests` | text[] | |
| `dietary_prefs` | text[] | |
| `must_visit` | text | optional |
| `estimated_budget` | text | AI-generated |
| `general_tips` | text[] | AI-generated |
| `is_public` | boolean | for share links |
| `share_token` | text | unique, nullable |
| `created_at` | timestamptz | |

### `itinerary_days`
One row per day in a trip's itinerary.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `trip_id` | uuid | FK → `trips` |
| `day_number` | int | |
| `date` | date | |
| `theme` | text | AI-generated |
| `daily_notes` | text | AI-generated |
| `places` | jsonb | array of Place objects |
| `meals` | jsonb | array of Meal objects |
| `weather` | jsonb | DayWeather object |
| `quick_tips` | text[] | AI-generated |

### `trip_chats`
Chat history for trip-specific AI assistant.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `trip_id` | uuid | FK → `trips` |
| `user_id` | uuid | FK → `auth.users` |
| `role` | text | `user` or `assistant` |
| `content` | text | |
| `created_at` | timestamptz | |

### `trip_collaborators`
Users invited to view/collaborate on a trip.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `trip_id` | uuid | FK → `trips` |
| `user_id` | uuid | FK → `auth.users`, nullable until accepted |
| `email` | text | invited email |
| `invite_token` | text | unique |
| `accepted` | boolean | |
| `created_at` | timestamptz | |

### `expenses`
Budget tracking entries per trip.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `trip_id` | uuid | FK → `trips` |
| `user_id` | uuid | FK → `auth.users` |
| `amount` | numeric | |
| `currency` | text | |
| `category` | text | Food, Transport, etc. |
| `date` | date | |
| `notes` | text | optional |
| `created_at` | timestamptz | |

## Row Level Security

All tables have RLS enabled. Users can only read/write their own rows. Shared trips (`is_public = true`) are readable by anyone via `share_token`.

## Trigger

`handle_new_user()` fires on `auth.users` insert and creates a matching `profiles` row automatically.
