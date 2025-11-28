-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_studios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_studios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.advertisements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  description text NOT NULL,
  url_image text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  link text,
  CONSTRAINT advertisements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_models (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  version text DEFAULT '1.0.0'::text,
  status text DEFAULT 'En entraînement'::text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  personality text,
  avatar_url text,
  greetings ARRAY,
  systemPrompt text,
  CONSTRAINT ai_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.coins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  amount integer NOT NULL,
  price numeric NOT NULL,
  bonus integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  contenu text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  answer_of uuid,
  reel_id uuid,
  live_id uuid,
  video_id uuid,
  longvideo_id uuid,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_longvideo_id_fkey FOREIGN KEY (longvideo_id) REFERENCES public.video_longue(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(owner_id),
  CONSTRAINT comments_answer_of_fkey FOREIGN KEY (answer_of) REFERENCES public.comments(id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_reel_id_fkey FOREIGN KEY (reel_id) REFERENCES public.reels(id),
  CONSTRAINT comments_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos_studios(id)
);
CREATE TABLE public.content_metrics_hourly (
  bucket_start timestamp with time zone NOT NULL,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['video'::text, 'long_video'::text])),
  watch_time numeric NOT NULL DEFAULT 0,
  views bigint NOT NULL DEFAULT 0,
  likes bigint NOT NULL DEFAULT 0,
  tips_amount numeric NOT NULL DEFAULT 0,
  tips_count bigint NOT NULL DEFAULT 0,
  CONSTRAINT content_metrics_hourly_pkey PRIMARY KEY (bucket_start, content_id, content_type)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  receiver_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  model_id uuid UNIQUE,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.ai_models(id),
  CONSTRAINT conversations_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.enterprises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nif text NOT NULL,
  stat text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  singleton boolean DEFAULT true UNIQUE,
  siret text,
  numero_tva text,
  CONSTRAINT enterprises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exclusive_show (
  id bigint NOT NULL DEFAULT nextval('exclusive_show_id_seq'::regclass),
  live_id uuid NOT NULL,
  user_id uuid NOT NULL,
  minute_time integer NOT NULL CHECK (minute_time > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exclusive_show_pkey PRIMARY KEY (id),
  CONSTRAINT exclusive_show_live_fk FOREIGN KEY (live_id) REFERENCES public.lives(id),
  CONSTRAINT exclusive_show_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.financial_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  commission_plateforme numeric DEFAULT 0.1,
  prix_jeton numeric NOT NULL,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.followings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid,
  followed_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT followings_pkey PRIMARY KEY (id),
  CONSTRAINT followings_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.ftp_upload_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  studio_id uuid,
  ftp_config jsonb NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL,
  progress integer DEFAULT 0,
  cloudflare_uid text,
  video_id uuid,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  CONSTRAINT ftp_upload_jobs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.incoming_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['model'::text, 'studio'::text])),
  base_percentage numeric NOT NULL,
  bonus_percentage numeric NOT NULL DEFAULT 0,
  minimum_income numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT incoming_shares_pkey PRIMARY KEY (id)
);
CREATE TABLE public.jetons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  balance integer DEFAULT 0,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT jetons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  reel_id uuid,
  live_id uuid,
  story_id uuid,
  comment_id uuid,
  video_id uuid,
  longvideo_id uuid,
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_longvideo_id_fkey FOREIGN KEY (longvideo_id) REFERENCES public.video_longue(id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(owner_id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT likes_reel_id_fkey FOREIGN KEY (reel_id) REFERENCES public.reels(id),
  CONSTRAINT likes_live_id_fkey FOREIGN KEY (live_id) REFERENCES public.lives(id),
  CONSTRAINT likes_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id),
  CONSTRAINT likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id),
  CONSTRAINT likes_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos_studios(id)
);
CREATE TABLE public.live_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  live_id uuid NOT NULL,
  user_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  price_paid integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone,
  status text NOT NULL DEFAULT 'active'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT live_access_pkey PRIMARY KEY (id),
  CONSTRAINT live_access_live_id_fkey FOREIGN KEY (live_id) REFERENCES public.lives(id)
);
CREATE TABLE public.live_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  live_id uuid,
  user_id uuid,
  message text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT live_chats_pkey PRIMARY KEY (id),
  CONSTRAINT live_chats_live_id_fkey FOREIGN KEY (live_id) REFERENCES public.lives(id),
  CONSTRAINT live_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.live_objectifs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  label text,
  amount numeric,
  live_id uuid,
  amount_paid numeric,
  CONSTRAINT live_objectifs_pkey PRIMARY KEY (id),
  CONSTRAINT live_objectifs_live_id_fkey FOREIGN KEY (live_id) REFERENCES public.lives(id)
);
CREATE TABLE public.live_planning (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  model_id uuid NOT NULL,
  user_id uuid,
  scheduled_date timestamp with time zone NOT NULL CHECK (scheduled_date > now()),
  duration_minutes integer DEFAULT 60 CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  status character varying DEFAULT 'available'::character varying CHECK (status::text = ANY (ARRAY['available'::character varying, 'reserved'::character varying, 'confirmed'::character varying, 'cancelled'::character varying, 'completed'::character varying, 'expired'::character varying]::text[])),
  price_tokens integer DEFAULT 0 CHECK (price_tokens >= 0),
  deposit_tokens integer DEFAULT 0 CHECK (deposit_tokens >= 0),
  title character varying,
  description text,
  max_participants integer DEFAULT 1 CHECK (max_participants > 0),
  current_participants integer DEFAULT 0 CHECK (current_participants >= 0),
  live_id uuid,
  reminder_sent boolean DEFAULT false,
  notification_24h boolean DEFAULT false,
  notification_1h boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reserved_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancellation_reason text,
  private_notes text,
  CONSTRAINT live_planning_pkey PRIMARY KEY (id),
  CONSTRAINT live_planning_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.profiles(id),
  CONSTRAINT live_planning_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT live_planning_live_id_fkey FOREIGN KEY (live_id) REFERENCES public.lives(id)
);
CREATE TABLE public.live_requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  live_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  coins integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  decided_at timestamp with time zone,
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT live_requests_pkey PRIMARY KEY (id),
  CONSTRAINT live_requests_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(owner_id),
  CONSTRAINT live_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.live_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  live_id uuid,
  consommateur_id uuid,
  reserved_at timestamp without time zone DEFAULT now(),
  CONSTRAINT live_reservations_pkey PRIMARY KEY (id),
  CONSTRAINT live_reservations_live_id_fkey FOREIGN KEY (live_id) REFERENCES public.lives(id),
  CONSTRAINT live_reservations_consommateur_id_fkey FOREIGN KEY (consommateur_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.lives (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createur_id uuid,
  title text NOT NULL,
  description text,
  date_live timestamp without time zone,
  prix_jetons integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  cf_live_input_uid text,
  pricing text DEFAULT 'gratuit'::text,
  actif boolean DEFAULT false,
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT lives_pkey PRIMARY KEY (id),
  CONSTRAINT lives_createur_id_fkey FOREIGN KEY (createur_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  sender_id uuid,
  content text,
  attachment_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title text,
  description text,
  price numeric,
  viewed boolean DEFAULT false,
  content_type text DEFAULT 'text'::text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.model_actions_price (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  label text,
  price numeric,
  owner_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  CONSTRAINT model_actions_price_pkey PRIMARY KEY (id),
  CONSTRAINT model_action_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.model_notification_preferences (
  user_id uuid NOT NULL,
  sub_new boolean NOT NULL DEFAULT true,
  content_like boolean NOT NULL DEFAULT true,
  content_signalment boolean NOT NULL DEFAULT true,
  content_sharing boolean NOT NULL DEFAULT true,
  sub_cancel boolean NOT NULL DEFAULT false,
  pay_incoming boolean NOT NULL DEFAULT false,
  wallet_withdraw boolean NOT NULL DEFAULT false,
  dm_new boolean NOT NULL DEFAULT true,
  comment_reply boolean NOT NULL DEFAULT false,
  auto_reply boolean NOT NULL DEFAULT false,
  platform_updates boolean NOT NULL DEFAULT true,
  security_alerts boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT model_notification_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT model_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.model_prices (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  mensual_subscription numeric,
  post_payant numeric,
  story_payant numeric,
  private_live numeric,
  owner_id uuid UNIQUE,
  camtocam_price numeric,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  object_vibrationprice numeric DEFAULT '0'::numeric,
  object_minuteprice numeric DEFAULT '0'::numeric,
  3months_prices numeric,
  6months_prices numeric,
  annualy_prices numeric,
  long_video_price numeric,
  descriptions jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT model_prices_pkey PRIMARY KEY (id),
  CONSTRAINT model_prices_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type USER-DEFINED NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  title text NOT NULL DEFAULT 'Notification'::text,
  reference_id text DEFAULT '#'::text,
  studio_id uuid,
  comment_id uuid,
  live_planning_id uuid,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT fk_notifications_studio FOREIGN KEY (studio_id) REFERENCES public.studios(id)
);
CREATE TABLE public.offers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text,
  promo_code text,
  description text,
  type USER-DEFINED,
  status USER-DEFINED,
  target USER-DEFINED,
  price numeric,
  reduction numeric,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  conditions ARRAY,
  max_usage numeric,
  min_subscription numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  income numeric DEFAULT '0'::numeric,
  views numeric DEFAULT '0'::numeric,
  updated_at timestamp with time zone DEFAULT now(),
  conversion_rate numeric DEFAULT '0'::numeric,
  created_by text DEFAULT 'admin'::text,
  CONSTRAINT offers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produit_id uuid,
  acheteur_id uuid,
  quantite integer NOT NULL,
  montant_total numeric NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'en_attente'::order_status,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.products(id),
  CONSTRAINT orders_acheteur_id_fkey FOREIGN KEY (acheteur_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.playlist_content_association (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  playlist_id uuid,
  reel_id uuid,
  post_id uuid,
  video_id uuid,
  longvideo_id uuid,
  CONSTRAINT playlist_content_association_pkey PRIMARY KEY (id),
  CONSTRAINT playlist_content_association_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos_studios(id),
  CONSTRAINT playlist_content_association_reel_id_fkey FOREIGN KEY (reel_id) REFERENCES public.reels(id),
  CONSTRAINT playlist_content_association_longvideo_id_fkey FOREIGN KEY (longvideo_id) REFERENCES public.video_longue(id),
  CONSTRAINT playlist_content_association_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT playlist_content_association_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id)
);
CREATE TABLE public.playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  owner_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT playlists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_image (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  image_url text,
  post_id uuid,
  rank numeric,
  width numeric,
  height numeric,
  CONSTRAINT post_image_pkey PRIMARY KEY (id),
  CONSTRAINT post_image_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.post_video (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  post_id uuid DEFAULT gen_random_uuid(),
  media_url text,
  rank numeric,
  width numeric,
  height numeric,
  CONSTRAINT post_video_pkey PRIMARY KEY (id),
  CONSTRAINT post_video_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createur_id uuid DEFAULT auth.uid(),
  media_url text,
  created_at timestamp without time zone DEFAULT now(),
  title text,
  description text,
  featured boolean DEFAULT false,
  is_360 boolean DEFAULT false,
  comment_allowed boolean DEFAULT true,
  downloadable boolean DEFAULT true,
  paid boolean DEFAULT false,
  category text,
  tags text,
  need_subscribe boolean,
  fixed_price numeric,
  video_fee numeric,
  visibility text,
  duration text,
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_createur_id_fkey FOREIGN KEY (createur_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendeur_id uuid,
  nom text NOT NULL,
  description text,
  prix numeric NOT NULL,
  image_url text,
  stock integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text CHECK (role = ANY (ARRAY['admin'::text, 'model'::text, 'client'::text, 'studio'::text, 'consumer'::text, 'seller'::text])),
  nom text,
  prenom text,
  username text UNIQUE,
  avatar_url text,
  bio text,
  actif boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  email text,
  owner_id uuid UNIQUE,
  birthday timestamp with time zone,
  adress text,
  phone text,
  proprietary_id uuid,
  privateshow_price numeric,
  country_code text DEFAULT 'FR'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.promo_packs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text,
  description text,
  price numeric,
  duration_in_days numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promo_packs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  percentage text NOT NULL,
  max_usage integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  mensual_subscription boolean DEFAULT false,
  post_payant boolean DEFAULT false,
  story_payant boolean DEFAULT false,
  private_live boolean DEFAULT false,
  camtocam_price boolean DEFAULT false,
  object_vibrationprice boolean DEFAULT false,
  object_minuteprice boolean DEFAULT false,
  3months_prices boolean DEFAULT false,
  6months_prices boolean DEFAULT false,
  annualy_prices boolean DEFAULT false,
  long_video_price boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id),
  CONSTRAINT promotions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  consommateur_id uuid,
  video_id uuid,
  type USER-DEFINED NOT NULL,
  montant numeric NOT NULL,
  date_achat timestamp without time zone DEFAULT now(),
  date_expiration timestamp without time zone,
  CONSTRAINT purchases_pkey PRIMARY KEY (id),
  CONSTRAINT purchases_consommateur_id_fkey FOREIGN KEY (consommateur_id) REFERENCES public.profiles(id),
  CONSTRAINT purchases_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.reels(id)
);
CREATE TABLE public.push_subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subscription jsonb NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  endpoint text,
  user_id uuid,
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createur_id uuid,
  title text NOT NULL,
  media_url text NOT NULL,
  thumbnail_url text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  visibility text,
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT reels_pkey PRIMARY KEY (id),
  CONSTRAINT reels_createur_id_fkey FOREIGN KEY (createur_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.reports (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  motifs text,
  post_id uuid,
  reel_id uuid,
  story_id uuid,
  video_id uuid,
  user_id uuid,
  details text,
  status USER-DEFINED DEFAULT 'attending'::signal_status,
  CONSTRAINT reports_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rtc_sessions (
  id bigint NOT NULL DEFAULT nextval('rtc_sessions_id_seq'::regclass),
  room_id text NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['publisher'::text, 'viewer'::text])),
  session_id text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT rtc_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rtc_tracks (
  id bigint NOT NULL DEFAULT nextval('rtc_tracks_id_seq'::regclass),
  rtc_session_id bigint NOT NULL,
  track_name text,
  kind text,
  mid text,
  CONSTRAINT rtc_tracks_pkey PRIMARY KEY (id),
  CONSTRAINT rtc_tracks_rtc_session_id_fkey FOREIGN KEY (rtc_session_id) REFERENCES public.rtc_sessions(id)
);
CREATE TABLE public.sales_channels (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text,
  description text,
  link text,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  price numeric,
  CONSTRAINT sales_channels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.social_links (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  label text,
  link text,
  logo text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  CONSTRAINT social_links_pkey PRIMARY KEY (id),
  CONSTRAINT social_links_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.stars (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 120),
  nationality text NOT NULL CHECK (char_length(nationality) >= 2 AND char_length(nationality) <= 80),
  image_url text,
  hair_color USER-DEFINED,
  height integer CHECK (height >= 140 AND height <= 220),
  weight integer CHECK (weight >= 40 AND weight <= 150),
  body_type USER-DEFINED,
  age integer CHECK (age >= 18 AND age <= 100),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stars_pkey PRIMARY KEY (id),
  CONSTRAINT stars_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text])),
  group_visibility text NOT NULL CHECK (group_visibility = ANY (ARRAY['public'::text, 'followers'::text])),
  created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT stories_pkey PRIMARY KEY (id),
  CONSTRAINT stories_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.studios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  name text NOT NULL,
  legal_name text,
  description text,
  founded_year integer CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(year FROM now())::integer),
  team_size integer CHECK (team_size >= 1),
  email text,
  phone text,
  website text,
  logo_url text,
  social jsonb NOT NULL DEFAULT '[]'::jsonb,
  portfolio_urls ARRAY NOT NULL DEFAULT '{}'::text[],
  street text,
  city text,
  state text,
  postal_code text,
  latitude numeric CHECK (latitude >= '-90'::integer::numeric AND latitude <= 90::numeric),
  longitude numeric CHECK (longitude >= '-180'::integer::numeric AND longitude <= 180::numeric),
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  equipment jsonb NOT NULL DEFAULT '[]'::jsonb,
  specialties ARRAY NOT NULL DEFAULT '{}'::text[],
  certifications ARRAY NOT NULL DEFAULT '{}'::text[],
  languages ARRAY NOT NULL DEFAULT '{}'::text[],
  day_rate numeric,
  currency character NOT NULL DEFAULT 'USD'::bpchar,
  pricing_notes text,
  availability jsonb NOT NULL DEFAULT '{}'::jsonb,
  insurance_provider text,
  insurance_policy_number text,
  tax_id text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text, 'pending'::text])),
  rating numeric CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  verified boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  country_code text,
  actif boolean,
  profile_id uuid,
  bank_iban text,
  bank_bic text,
  bank_account_holder text,
  bank_name text,
  crypto_wallet_address text,
  crypto_network text,
  crypto_currency text,
  bank_verification_status text DEFAULT 'pending'::text,
  crypto_verification_status text DEFAULT 'pending'::text,
  bank_verified_at timestamp with time zone,
  crypto_verified_at timestamp with time zone,
  cover_image_url text,
  CONSTRAINT studios_pkey PRIMARY KEY (id),
  CONSTRAINT studios_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT studios_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL,
  billing_period text NOT NULL CHECK (billing_period = ANY (ARRAY['monthly'::text, 'quarterly'::text, 'semiannual'::text, 'annual'::text])),
  amount_eur numeric NOT NULL CHECK (amount_eur >= 0::numeric),
  currency text NOT NULL DEFAULT 'EUR'::text,
  payment_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status = ANY (ARRAY['succeeded'::text, 'failed'::text, 'refunded'::text, 'pending'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  price_ht numeric,
  vat_rate numeric,
  vat_amount numeric,
  price_ttc numeric,
  bank_fee_rate numeric DEFAULT 15.00,
  bank_fee_amount numeric,
  total_paid numeric,
  country_code text DEFAULT 'FR'::text,
  CONSTRAINT subscription_payments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_sub_payment_subscription FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id)
);
CREATE TABLE public.subscriptions (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  mensual_price numeric,
  name text,
  3month_price numeric,
  6month_price numeric,
  studio_access boolean,
  include_token numeric,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  iamodel_access boolean,
  vr_access boolean,
  connected_object_access boolean,
  socialmedia_access boolean,
  id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  ia_token numeric,
  annual_price numeric,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transaction_jeton (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source_id uuid,
  destination_id uuid,
  content_id uuid,
  content_type text,
  amount numeric,
  paypal_order_id text,
  price_eur_ht numeric,
  price_eur_ttc numeric,
  vat_rate_percent numeric,
  vat_country text,
  CONSTRAINT transaction_jeton_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  type USER-DEFINED,
  montant numeric NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::transaction_status,
  created_at timestamp with time zone,
  invoice_number bigint,
  profile_type USER-DEFINED,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_activity_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_model_subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  model_id uuid NOT NULL,
  amount_eur numeric NOT NULL CHECK (amount_eur >= 0::numeric),
  currency text NOT NULL DEFAULT 'EUR'::text,
  payment_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status = ANY (ARRAY['succeeded'::text, 'failed'::text, 'pending'::text, 'skipped'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  price_ht numeric,
  vat_amount numeric,
  bank_fee numeric,
  CONSTRAINT user_model_subscription_payments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_model_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  model_id uuid,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  subscription_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_model_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_model_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(owner_id),
  CONSTRAINT user_model_subscriptions_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.user_notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type USER-DEFINED NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_agent text NOT NULL,
  session_token text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_active timestamp with time zone DEFAULT now(),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  subscription_id uuid NOT NULL,
  billing_period text NOT NULL DEFAULT 'monthly'::text,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  auto_renew boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(owner_id),
  CONSTRAINT user_subscriptions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id)
);
CREATE TABLE public.user_viewer_number (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid DEFAULT gen_random_uuid(),
  content_id uuid,
  content_type text,
  number_of_view integer DEFAULT 0,
  CONSTRAINT user_viewer_number_pkey PRIMARY KEY (id),
  CONSTRAINT user_viewer_number_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.user_visionage_time (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid DEFAULT gen_random_uuid(),
  content_id uuid DEFAULT gen_random_uuid(),
  view_duration numeric DEFAULT '0'::numeric,
  content_type text,
  CONSTRAINT user_visionage_time_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vat_rates (
  country_code text NOT NULL,
  country_name text NOT NULL,
  standard_rate numeric NOT NULL,
  effective_date date,
  source_url text,
  checked_at date NOT NULL DEFAULT now(),
  CONSTRAINT vat_rates_pkey PRIMARY KEY (country_code)
);
CREATE TABLE public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  commission numeric NOT NULL,
  affiliate_target_url text NOT NULL,
  media_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vendors_pkey PRIMARY KEY (id),
  CONSTRAINT vendors_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.video_longue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createur_id uuid,
  is_360 boolean,
  comment_allowed boolean DEFAULT true,
  downloadable boolean DEFAULT false,
  paid boolean DEFAULT false,
  need_subscribe boolean DEFAULT false,
  featured boolean DEFAULT false,
  fixed_price numeric,
  video_fee numeric,
  media_url text,
  thumbnail_url text,
  duration text,
  duration_seconds integer,
  title text,
  description text,
  tags text,
  category text,
  visibility text DEFAULT 'public'::text CHECK (visibility = ANY (ARRAY['public'::text, 'followers'::text, 'private'::text, 'unlisted'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  width numeric,
  height numeric,
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT video_longue_pkey PRIMARY KEY (id),
  CONSTRAINT video_longue_createur_id_fkey FOREIGN KEY (createur_id) REFERENCES public.profiles(owner_id)
);
CREATE TABLE public.video_stars (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  video_id uuid NOT NULL,
  star_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_stars_pkey PRIMARY KEY (id),
  CONSTRAINT video_stars_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT video_stars_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos_studios(id),
  CONSTRAINT video_stars_star_id_fkey FOREIGN KEY (star_id) REFERENCES public.stars(id)
);
CREATE TABLE public.videos_studios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createur_id uuid,
  is_360 boolean,
  comment_allowed boolean,
  downloadable boolean,
  paid boolean,
  need_subscribe boolean,
  fixed_price numeric,
  video_fee numeric,
  created_at timestamp without time zone DEFAULT now(),
  featured boolean,
  media_url text,
  duration text,
  title text,
  description text,
  visibility text,
  category text,
  tags text,
  thumbnail_url text,
  connected_mode boolean NOT NULL DEFAULT false,
  CONSTRAINT videos_studios_pkey PRIMARY KEY (id),
  CONSTRAINT videos_studios_createur_id_fkey FOREIGN KEY (createur_id) REFERENCES public.studios(owner_id)
);