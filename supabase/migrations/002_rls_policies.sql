-- Vibe Planner Row Level Security Policies
-- Migration: 002_rls_policies.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- ROUTINES POLICIES
-- ============================================
CREATE POLICY "Users can view own routines"
    ON public.routines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own routines"
    ON public.routines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
    ON public.routines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
    ON public.routines FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- PLANS POLICIES
-- ============================================
CREATE POLICY "Users can view own plans"
    ON public.plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
    ON public.plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
    ON public.plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
    ON public.plans FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TASKS POLICIES
-- ============================================
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- ACTIVITY LOGS POLICIES
-- ============================================
CREATE POLICY "Users can view own activity logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);
