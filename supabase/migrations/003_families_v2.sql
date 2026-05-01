-- ============================================
-- FINANCELIO v2.0 - MIGRATION: FAMILIES & TRANSACTIONS UPDATE
-- Execute no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. FAMILIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Minha Família',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. FAMILY_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- ============================================
-- 3. FAMILY_INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::text,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. UPDATE TRANSACTIONS TABLE
-- Adds family_id, is_fixed, recurring_frequency
-- ============================================
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly') OR recurring_frequency IS NULL);

-- ============================================
-- 5. UPDATE CATEGORIES TABLE
-- Adds family_id and type fields
-- ============================================
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable (system categories belong to no user)
ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- 6. ADD PROFILES TABLE (for user names)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ROW LEVEL SECURITY - NEW TABLES
-- ============================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Families: members can view their family
CREATE POLICY "Family members can view their family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Family members: members can view all members
CREATE POLICY "Family members can view all members" ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Family members: only admins can manage members
CREATE POLICY "Admins can manage family members" ON family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = family_members.family_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Family invites: any authenticated user can create invites
CREATE POLICY "Authenticated users can create invites" ON family_invites
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Family invites: members can view invites for their family
CREATE POLICY "Members can view family invites" ON family_invites
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Family invites: only pending invites can be updated (for acceptance)
CREATE POLICY "Users can update own pending invites" ON family_invites
  FOR UPDATE USING (
    status = 'pending' AND auth.uid() IS NOT NULL
  );

-- Profiles: users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 8. UPDATE EXISTING RLS POLICIES
-- ============================================

-- Transactions: users can CRUD own transactions
-- AND family members can view family transactions
DROP POLICY IF EXISTS "Users can CRUD own transactions" ON transactions;
CREATE POLICY "Users can CRUD own transactions" ON transactions
  FOR ALL USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    ))
  );

-- Categories: users can CRUD own categories
-- AND family members can view family categories
DROP POLICY IF EXISTS "Users can CRUD own categories" ON categories;
CREATE POLICY "Users can CRUD own categories" ON categories
  FOR ALL USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    ))
  );

-- ============================================
-- 9. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON family_invites(token);
CREATE INDEX IF NOT EXISTS idx_family_invites_family ON family_invites(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_family ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_categories_family ON categories(family_id);
CREATE INDEX IF NOT EXISTS idx_profiles_family ON profiles(family_id);

-- ============================================
-- 10. FUNCTIONS
-- ============================================

-- Function to get or create a family for a user
CREATE OR REPLACE FUNCTION get_or_create_family(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_family_id UUID;
  v_profile_family_id UUID;
BEGIN
  -- Check if user already has a family via profiles
  SELECT family_id INTO v_profile_family_id
  FROM profiles
  WHERE id = p_user_id;

  IF v_profile_family_id IS NOT NULL THEN
    RETURN v_profile_family_id;
  END IF;

  -- Create new family
  INSERT INTO families (name)
  VALUES ('Família ' || COALESCE(
    (SELECT full_name FROM profiles WHERE id = p_user_id),
    (SELECT email FROM auth.users WHERE id = p_user_id)
  ))
  RETURNING id INTO v_family_id;

  -- Update profile with family_id
  UPDATE profiles SET family_id = v_family_id WHERE id = p_user_id;

  -- Add user as admin in family_members
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (v_family_id, p_user_id, 'admin');

  RETURN v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept family invite
CREATE OR REPLACE FUNCTION accept_family_invite(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite family_invites%ROWTYPE;
BEGIN
  -- Get invite
  SELECT * INTO v_invite
  FROM family_invites
  WHERE token = p_token AND status = 'pending' AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Add user to family_members
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (v_invite.family_id, p_user_id, 'member')
  ON CONFLICT (family_id, user_id) DO NOTHING;

  -- Update profile with family_id
  UPDATE profiles SET family_id = v_invite.family_id WHERE id = p_user_id;

  -- Mark invite as accepted
  UPDATE family_invites SET status = 'accepted' WHERE id = v_invite.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. TRIGGER to auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
