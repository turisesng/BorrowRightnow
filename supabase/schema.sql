-- =========================================================================
-- BorrowRight AI: Comprehensive Supabase PostgreSQL Database Schema
-- Production Ready, Normalized, & Row Level Security (RLS) Compliant
-- =========================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist with cascade (for a clean slate/re-migration)
drop table if exists public.audit_logs cascade;
drop table if exists public.admins cascade;
drop table if exists public.financial_goals cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.scam_reports cascade;
drop table if exists public.knowledge_articles cascade;
drop table if exists public.regulatory_records cascade;
drop table if exists public.support_tickets cascade;
drop table if exists public.notifications cascade;
drop table if exists public.loan_recommendations cascade;
drop table if exists public.repayments cascade;
drop table if exists public.debts cascade;
drop table if exists public.loan_history cascade;
drop table if exists public.loan_applications cascade;
drop table if exists public.lender_products cascade;
drop table if exists public.lenders cascade;
drop table if exists public.financial_health cascade;
drop table if exists public.profiles cascade;

-- Common reusable updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;


-- =========================================================================
-- 1. USERS PROFILE TABLE (Extends Supabase auth.users)
-- =========================================================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    gender text check (gender in ('Male', 'Female', 'Other')),
    date_of_birth date,
    phone text unique,
    email text unique not null,
    state text,
    city text,
    employment_status text check (employment_status in ('Employed', 'Self-Employed', 'Unemployed', 'Student')) default 'Employed',
    employer text,
    occupation text,
    monthly_income numeric(15, 2) default 0.00 not null,
    income_frequency text check (income_frequency in ('Monthly', 'Weekly', 'Bi-Weekly', 'Irregular')) default 'Monthly',
    financial_goals text[] default '{}',
    bvn text, -- Encrypted in production
    nin text, -- Encrypted in production
    emergency_contact_name text,
    emergency_contact_phone text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 2. FINANCIAL HEALTH SCORES TABLE
-- =========================================================================
create table public.financial_health (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    score integer check (score >= 0 and score <= 100) not null,
    dti numeric(5, 2) not null, -- Debt to Income Ratio %
    savings_ratio numeric(5, 2) not null, -- Savings Ratio %
    cash_flow_score integer check (cash_flow_score >= 0 and cash_flow_score <= 100) not null,
    emergency_fund_score integer check (emergency_fund_score >= 0 and emergency_fund_score <= 100) not null,
    loan_burden_score integer check (loan_burden_score >= 0 and loan_burden_score <= 100) not null,
    monthly_disposable_income numeric(15, 2) not null,
    recommendations text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_financial_health_updated_at
    before update on public.financial_health
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 3. LICENSED LENDERS TABLE
-- =========================================================================
create table public.lenders (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    type text check (type in ('Commercial Bank', 'Microfinance Bank', 'Finance Company', 'Digital Lender')) not null,
    license_number text unique not null,
    regulator text check (regulator in ('CBN', 'FCCPC', 'SEC')) not null,
    rating numeric(3, 2) default 0.00 check (rating >= 0.00 and rating <= 5.00),
    rating_count integer default 0,
    website text,
    contact_email text,
    contact_phone text,
    complaints_process text,
    consumer_rights text[] default '{}',
    digital_only boolean default false,
    approval_speed text default 'Instant',
    min_income_required numeric(15, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_lenders_updated_at
    before update on public.lenders
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 4. LENDER PRODUCTS TABLE
-- =========================================================================
create table public.lender_products (
    id uuid default gen_random_uuid() primary key,
    lender_id uuid references public.lenders(id) on delete cascade not null,
    name text not null,
    min_amount numeric(15, 2) not null,
    max_amount numeric(15, 2) not null,
    min_interest_rate numeric(5, 2) not null, -- Monthly %
    max_interest_rate numeric(5, 2) not null, -- Monthly %
    apr numeric(5, 2) not null, -- Annual Percentage Rate %
    processing_fee numeric(5, 2) default 0.00,
    min_tenor integer not null check (min_tenor > 0), -- months
    max_tenor integer not null check (max_tenor >= min_tenor), -- months
    collateral_required boolean default false,
    requirements text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_lender_products_updated_at
    before update on public.lender_products
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 5. LOAN APPLICATIONS INDEX TABLE (User credit histories)
-- =========================================================================
create table public.loan_applications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.lender_products(id) on delete set null,
    requested_amount numeric(15, 2) not null,
    term_months integer not null check (term_months > 0),
    status text check (status in ('Draft', 'Submitted', 'Approved', 'Rejected', 'Closed')) default 'Submitted' not null,
    applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_loan_applications_updated_at
    before update on public.loan_applications
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 6. LOAN HISTORY TABLE (Historical background loan details)
-- =========================================================================
create table public.loan_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    lender_name text not null,
    amount numeric(15, 2) not null check (amount > 0),
    interest_rate numeric(5, 2) not null check (interest_rate >= 0),
    start_date date not null,
    end_date date,
    status text check (status in ('Settled', 'Defaulted', 'Written-Off', 'Active')) default 'Settled' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_loan_history_updated_at
    before update on public.loan_history
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 7. DEBTS LIABILITY TRACKING TABLE
-- =========================================================================
create table public.debts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    lender_name text not null,
    amount numeric(15, 2) not null check (amount > 0),
    interest_rate numeric(5, 2) not null check (interest_rate >= 0),
    monthly_payment numeric(15, 2) not null check (monthly_payment >= 0),
    remaining_term integer not null check (remaining_term >= 0), -- months
    next_due_date date,
    priority integer default 3 check (priority >= 1 and priority <= 5),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_debts_updated_at
    before update on public.debts
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 8. LOAN RECOMMENDATIONS TABLE
-- =========================================================================
create table public.loan_recommendations (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.lender_products(id) on delete cascade not null,
    suitability_score integer check (suitability_score >= 0 and suitability_score <= 100) not null,
    reasoning text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_loan_recommendations_updated_at
    before update on public.loan_recommendations
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 9. NOTIFICATIONS TABLE
-- =========================================================================
create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text check (type in ('Alert', 'Recommendation', 'Compliance', 'Security')) default 'Alert' not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_notifications_updated_at
    before update on public.notifications
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 10. SUPPORT TICKETS TABLE
-- =========================================================================
create table public.support_tickets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    subject text not null,
    category text not null,
    description text not null,
    status text check (status in ('Open', 'In Progress', 'Resolved')) default 'Open' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_support_tickets_updated_at
    before update on public.support_tickets
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 11. REGULATORY RECORDS TABLE (E.g. CBN directives/releases)
-- =========================================================================
create table public.regulatory_records (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    publisher text check (publisher in ('CBN', 'FCCPC', 'SEC', 'NDPR')) not null,
    summary text not null,
    url text,
    published_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_regulatory_records_updated_at
    before update on public.regulatory_records
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 12. KNOWLEDGE BASE ARTICLES TABLE
-- =========================================================================
create table public.knowledge_articles (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    category text check (category in ('Rights', 'Debt Management', 'Interest Rates', 'Financial Planning')) not null,
    reading_time_minutes integer default 3 check (reading_time_minutes > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_knowledge_articles_updated_at
    before update on public.knowledge_articles
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 13. SCAM REPORTS TABLE
-- =========================================================================
create table public.scam_reports (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    lender_name text not null,
    contact_info text,
    scam_type text not null,
    evidence_text text,
    screenshot_url text,
    status text check (status in ('Pending', 'Verified Scam', 'Safe', 'Under Review')) default 'Pending' not null,
    risk_score integer check (risk_score >= 0 and risk_score <= 100),
    analysis_reason text,
    reported_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_scam_reports_updated_at
    before update on public.scam_reports
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 14. USER PREFERENCES TABLE
-- =========================================================================
create table public.user_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    theme text check (theme in ('light', 'dark')) default 'light' not null,
    receive_push boolean default true not null,
    receive_email boolean default true not null,
    risk_appetite text check (risk_appetite in ('Conservative', 'Moderate', 'Aggressive')) default 'Moderate' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_user_preferences_updated_at
    before update on public.user_preferences
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 15. FINANCIAL GOALS TABLE
-- =========================================================================
create table public.financial_goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    target_amount numeric(15, 2) not null check (target_amount > 0),
    current_amount numeric(15, 2) default 0.00 not null check (current_amount >= 0),
    target_date date,
    category text default 'General' not null,
    is_completed boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_financial_goals_updated_at
    before update on public.financial_goals
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- 16. AUDIT LOGS TABLE
-- =========================================================================
create table public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    actor_id uuid, -- Reference to optional user or admin UUID
    actor_email text,
    action text not null,
    details text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);


-- =========================================================================
-- 17. ADMINS TABLE
-- =========================================================================
create table public.admins (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    role text check (role in ('SuperAdmin', 'Moderator', 'Auditor')) default 'Moderator' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone -- Soft delete column
);

create trigger trigger_admins_updated_at
    before update on public.admins
    for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =========================================================================

-- Profiles & Prefs Indexes
create index idx_profiles_email on public.profiles(email) where deleted_at is null;
create index idx_profiles_phone on public.profiles(phone) where deleted_at is null;
create index idx_user_preferences_user_id on public.user_preferences(user_id) where deleted_at is null;

-- Financial Indices
create index idx_financial_health_user_id on public.financial_health(user_id) where deleted_at is null;
create index idx_debts_user_id on public.debts(user_id) where deleted_at is null;
create index idx_financial_goals_user_id on public.financial_goals(user_id) where deleted_at is null;

-- Lender catalogue indices
create index idx_lenders_name on public.lenders(name) where deleted_at is null;
create index idx_lenders_regulator on public.lenders(regulator) where deleted_at is null;
create index idx_lender_products_lender_id on public.lender_products(lender_id) where deleted_at is null;

-- Loan indexation
create index idx_loan_applications_user_id on public.loan_applications(user_id) where deleted_at is null;
create index idx_loan_history_user_id on public.loan_history(user_id) where deleted_at is null;
create index idx_loan_recommendations_user_id on public.loan_recommendations(user_id) where deleted_at is null;

-- CRM & Messaging indexation
create index idx_notifications_user_id on public.notifications(user_id) where deleted_at is null;
create index idx_notifications_unread on public.notifications(user_id) where is_read = false and deleted_at is null;
create index idx_support_tickets_user_id on public.support_tickets(user_id) where deleted_at is null;
create index idx_scam_reports_user_id on public.scam_reports(user_id) where deleted_at is null;

-- Core audit indexes
create index idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index idx_admins_user_id on public.admins(user_id) where deleted_at is null;


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) SETTINGS & POLICIES
-- =========================================================================

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.financial_health enable row level security;
alter table public.lenders enable row level security;
alter table public.lender_products enable row level security;
alter table public.loan_applications enable row level security;
alter table public.loan_history enable row level security;
alter table public.debts enable row level security;
alter table public.loan_recommendations enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.regulatory_records enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.scam_reports enable row level security;
alter table public.user_preferences enable row level security;
alter table public.financial_goals enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admins enable row level security;

-- Profiles: Users manage only their own data
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id and deleted_at is null);

create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id and deleted_at is null);

-- Financial Health: Private scores
create policy "Users can view own financial health" on public.financial_health
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own financial health" on public.financial_health
    for insert with check (auth.uid() = user_id);

create policy "Users can update own financial health" on public.financial_health
    for update using (auth.uid() = user_id and deleted_at is null);

-- Lenders & Products: Public catalog
create policy "Anyone can select lenders" on public.lenders
    for select using (deleted_at is null);

create policy "Anyone can select lender products" on public.lender_products
    for select using (deleted_at is null);

-- Loan Applications: Private transactions
create policy "Users can view own applications" on public.loan_applications
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own applications" on public.loan_applications
    for insert with check (auth.uid() = user_id);

create policy "Users can update own applications" on public.loan_applications
    for update using (auth.uid() = user_id and deleted_at is null);

-- Loan History: Private record
create policy "Users can view own loan history" on public.loan_history
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own loan history" on public.loan_history
    for insert with check (auth.uid() = user_id);

-- Debts Liability Tracker
create policy "Users can view own debts" on public.debts
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own debts" on public.debts
    for insert with check (auth.uid() = user_id);

create policy "Users can update own debts" on public.debts
    for update using (auth.uid() = user_id and deleted_at is null);

create policy "Users can delete own debts" on public.debts
    for delete using (auth.uid() = user_id and deleted_at is null);

-- Loan Recommendations
create policy "Users can view own loan recommendations" on public.loan_recommendations
    for select using (auth.uid() = user_id and deleted_at is null);

-- Notifications
create policy "Users can view own notifications" on public.notifications
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can update own notifications" on public.notifications
    for update using (auth.uid() = user_id and deleted_at is null);

-- Support Tickets
create policy "Users can view own support tickets" on public.support_tickets
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own support tickets" on public.support_tickets
    for insert with check (auth.uid() = user_id);

-- Knowledge Base & Regulatory Records: Public lookup
create policy "Anyone can select regulatory records" on public.regulatory_records
    for select using (deleted_at is null);

create policy "Anyone can select knowledge articles" on public.knowledge_articles
    for select using (deleted_at is null);

-- Scam Reports: Anonymous view, authenticated reporting
create policy "Anyone can select scam reports" on public.scam_reports
    for select using (deleted_at is null);

create policy "Authenticated users can insert scam reports" on public.scam_reports
    for insert with check (auth.uid() is not null);

-- User Preferences
create policy "Users can view own preferences" on public.user_preferences
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own preferences" on public.user_preferences
    for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
    for update using (auth.uid() = user_id and deleted_at is null);

-- Financial Goals
create policy "Users can view own financial goals" on public.financial_goals
    for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own financial goals" on public.financial_goals
    for insert with check (auth.uid() = user_id);

create policy "Users can update own financial goals" on public.financial_goals
    for update using (auth.uid() = user_id and deleted_at is null);

create policy "Users can delete own financial goals" on public.financial_goals
    for delete using (auth.uid() = user_id and deleted_at is null);

-- Audit Logs: Private insert, system review
create policy "Authenticated users can write audit logs" on public.audit_logs
    for insert with check (auth.uid() is not null);

create policy "Admins can view all audit logs" on public.audit_logs
    for select using (
        exists (
            select 1 from public.admins 
            where admins.user_id = auth.uid() and admins.deleted_at is null
        )
    );

-- Admins: Review membership
create policy "Anyone can check admin status" on public.admins
    for select using (deleted_at is null);
