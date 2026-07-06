-- =========================================================================
-- BorrowRight AI: Supabase PostgreSQL Database Schema
-- Production Ready, Normalized, & Row Level Security (RLS) Compliant
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS PROFILE TABLE (Extensions of auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    gender text check (gender in ('Male', 'Female', 'Other')),
    date_of_birth date,
    phone text unique,
    email text unique not null,
    state text,
    city text,
    employment_status text check (employment_status in ('Employed', 'Self-Employed', 'Unemployed', 'Student')),
    employer text,
    occupation text,
    monthly_income numeric(15, 2) default 0.00,
    income_frequency text check (income_frequency in ('Monthly', 'Weekly', 'Bi-Weekly', 'Irregular')),
    financial_goals text[] default '{}',
    bvn text, -- Encrypted in production
    nin text, -- Encrypted in production
    emergency_contact_name text,
    emergency_contact_phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FINANCIAL HEALTH SCORES
create table public.financial_health_scores (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    score integer check (score >= 0 and score <= 100) not null,
    dti numeric(5, 2) not null, -- Debt to Income Ratio %
    savings_ratio numeric(5, 2) not null, -- Savings Ratio %
    cash_flow_score integer check (cash_flow_score >= 0 and cash_flow_score <= 100) not null,
    emergency_fund_score integer check (emergency_fund_score >= 0 and emergency_fund_score <= 100) not null,
    loan_burden_score integer check (loan_burden_score >= 0 and loan_burden_score <= 100) not null,
    monthly_disposable_income numeric(15, 2) not null,
    recommendations text[] default '{}',
    calculated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. DEBTS (Liability tracking)
create table public.debts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    lender_name text not null,
    amount numeric(15, 2) not null,
    interest_rate numeric(5, 2) not null, -- Monthly %
    monthly_payment numeric(15, 2) not null,
    remaining_term integer not null, -- months
    next_due_date date,
    priority integer default 3 check (priority >= 1 and priority <= 5),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. DEBT REPAYMENTS LOG (Actual paid list)
create table public.repayments (
    id uuid default uuid_generate_v4() primary key,
    debt_id uuid references public.debts(id) on delete cascade not null,
    amount numeric(15, 2) not null,
    principal_paid numeric(15, 2) not null,
    interest_paid numeric(15, 2) not null,
    remaining_balance numeric(15, 2) not null,
    repayment_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. LOAN PREFERENCES & SEARCH FILTERS
create table public.loan_preferences (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    desired_amount numeric(15, 2) not null,
    repayment_period integer not null, -- months
    loan_purpose text not null,
    urgency text check (urgency in ('Low', 'Medium', 'High')),
    collateral_available boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. LICENSED LENDERS
create table public.lenders (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type text check (type in ('Commercial Bank', 'Microfinance Bank', 'Finance Company', 'Digital Lender')) not null,
    license_number text unique not null,
    regulator text check (regulator in ('CBN', 'FCCPC', 'SEC')) not null,
    rating numeric(3, 2) default 0.00,
    rating_count integer default 0,
    website text,
    contact_email text,
    contact_phone text,
    complaints_process text,
    consumer_rights text[] default '{}',
    digital_only boolean default false,
    approval_speed text,
    min_income_required numeric(15, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. LENDER PRODUCTS
create table public.lender_products (
    id uuid default uuid_generate_v4() primary key,
    lender_id uuid references public.lenders(id) on delete cascade not null,
    name text not null,
    min_amount numeric(15, 2) not null,
    max_amount numeric(15, 2) not null,
    min_interest_rate numeric(5, 2) not null,
    max_interest_rate numeric(5, 2) not null,
    apr numeric(5, 2) not null,
    processing_fee numeric(5, 2) default 0.00,
    min_tenor integer not null, -- months
    max_tenor integer not null, -- months
    collateral_required boolean default false,
    requirements text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. LOAN APPLICATIONS INDEX (Simulated for user credit history)
create table public.loan_applications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.lender_products(id) on delete set null,
    requested_amount numeric(15, 2) not null,
    term_months integer not null,
    status text check (status in ('Draft', 'Submitted', 'Approved', 'Rejected', 'Closed')) default 'Submitted' not null,
    applied_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. SCAM REPORTS
create table public.scam_reports (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    lender_name text not null,
    contact_info text,
    scam_type text not null,
    evidence_text text,
    screenshot_url text,
    status text check (status in ('Pending', 'Verified Scam', 'Safe', 'Under Review')) default 'Pending' not null,
    risk_score integer check (risk_score >= 0 and risk_score <= 100),
    analysis_reason text,
    reported_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SUPPORT TICKETS
create table public.support_tickets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    subject text not null,
    category text not null,
    description text not null,
    status text check (status in ('Open', 'In Progress', 'Resolved')) default 'Open' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. AUDIT LOGS
create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    actor_id uuid, -- admin id or user id
    actor_email text,
    action text not null,
    details text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.financial_health_scores enable row level security;
alter table public.debts enable row level security;
alter table public.repayments enable row level security;
alter table public.loan_preferences enable row level security;
alter table public.loan_applications enable row level security;
alter table public.scam_reports enable row level security;
alter table public.support_tickets enable row level security;

-- Profiles: Users can select/update only their own records
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);

-- Debts: Users can perform CRUD only on their own records
create policy "Users can view own debts" on public.debts
    for select using (auth.uid() = user_id);

create policy "Users can insert own debts" on public.debts
    for insert with check (auth.uid() = user_id);

create policy "Users can update own debts" on public.debts
    for update using (auth.uid() = user_id);

create policy "Users can delete own debts" on public.debts
    for delete using (auth.uid() = user_id);

-- Lenders: Readable by everyone (public catalog)
alter table public.lenders enable row level security;
create policy "Lenders are readable by authenticated users" on public.lenders
    for select using (true);

alter table public.lender_products enable row level security;
create policy "Products are readable by authenticated users" on public.lender_products
    for select using (true);
