-- 1. Add the missing UPDATE policy so users can update their own display name from the Profile page
CREATE POLICY "Enable Update for users" ON public.user_points FOR
UPDATE USING (auth.uid() = id);
-- 2. Retroactively update all existing user_points display names to match their current auth.users full_name!
UPDATE public.user_points up
SET display_name = COALESCE(
        (
            SELECT raw_user_meta_data->>'full_name'
            FROM auth.users au
            WHERE au.id = up.id
        ),
        'Eco-Warrior'
    )
WHERE display_name = 'Eco-Warrior';