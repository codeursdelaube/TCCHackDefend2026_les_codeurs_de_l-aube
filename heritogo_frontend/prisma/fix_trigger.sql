-- =====================================================
-- HERITOGO — Fix trigger de création de profil (v2)
-- Coller dans Supabase Dashboard > SQL Editor > Run
-- =====================================================

-- 1. Supprimer le bon trigger (trouvé dans l'erreur) + CASCADE
DROP TRIGGER IF EXISTS trg_new_user_profile ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Recréer la fonction avec gestion des valeurs NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role public.user_role;
BEGIN
  -- Récupérer le rôle depuis les metadata, défaut = tourist
  BEGIN
    user_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'tourist'::public.user_role
    );
  EXCEPTION WHEN invalid_text_representation THEN
    user_role := 'tourist'::public.user_role;
  END;

  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    preferred_lang,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'preferred_lang', 'fr'),
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Recréer le trigger (avec le même nom qu'avant pour cohérence)
CREATE TRIGGER trg_new_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérification
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_new_user_profile';
