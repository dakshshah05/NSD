-- Create a table linking to Supabase's built in auth.users
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
-- Allow users to read all user points (for the leaderboard)
CREATE POLICY "Enable Read Access for All to user_points" ON public.user_points FOR
SELECT USING (true);
-- Create an RPC (Remote Procedure Call) that UI can safely hit to add points
-- This prevents users from inspecting the network and sending {"points": 999999}
CREATE OR REPLACE FUNCTION add_green_points(user_id UUID, points_to_add INT) RETURNS void AS $$ BEGIN -- Check if user exists in the points table, if not, create them
    IF NOT EXISTS (
        SELECT 1
        FROM public.user_points
        WHERE id = user_id
    ) THEN
INSERT INTO public.user_points (id, display_name, points)
VALUES (
        user_id,
        COALESCE(
            (
                SELECT raw_user_meta_data->>'full_name'
                FROM auth.users
                WHERE id = user_id
            ),
            'Eco-Warrior'
        ),
        points_to_add
    );
ELSE -- If they exist, add to their points
UPDATE public.user_points
SET points = points + points_to_add
WHERE id = user_id;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;