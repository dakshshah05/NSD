-- Create the timetable schema
CREATE TABLE IF NOT EXISTS public.timetable (
    id SERIAL PRIMARY KEY,
    course_name TEXT NOT NULL,
    room_id TEXT NOT NULL,
    day_of_week INT NOT NULL,
    -- 0 to 6 (Sunday to Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);
-- Enable RLS
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
-- Allow public read access to the timetable (or authenticated if preferred)
CREATE POLICY "Enable Read Access for All" ON public.timetable FOR
SELECT USING (true);
-- Insert Mock Data
INSERT INTO public.timetable (
        course_name,
        room_id,
        day_of_week,
        start_time,
        end_time
    )
VALUES -- BCA (Bachelor of Computer Applications) in Lab (Room 402/Lab)
    (
        'BCA Data Structures',
        'Lab',
        1,
        '09:00:00',
        '11:00:00'
    ),
    ('BCA Web Dev', 'Lab', 2, '11:00:00', '13:00:00'),
    ('BCA Web Dev', 'Lab', 4, '11:00:00', '13:00:00'),
    -- BBA (Bachelor of Business Administration) in Room 101 Let's make one run every day so we can test it
    (
        'BBA Marketing',
        '101',
        0,
        '10:00:00',
        '12:00:00'
    ),
    (
        'BBA Marketing',
        '101',
        1,
        '10:00:00',
        '12:00:00'
    ),
    (
        'BBA Marketing',
        '101',
        2,
        '10:00:00',
        '12:00:00'
    ),
    (
        'BBA Marketing',
        '101',
        3,
        '10:00:00',
        '12:00:00'
    ),
    (
        'BBA Marketing',
        '101',
        4,
        '10:00:00',
        '12:00:00'
    ),
    (
        'BBA Marketing',
        '101',
        5,
        '10:00:00',
        '12:00:00'
    ),
    (
        'BBA Marketing',
        '101',
        6,
        '10:00:00',
        '12:00:00'
    ),
    -- BCOM (Bachelor of Commerce) in Room 102
    (
        'BCOM Accounting',
        '102',
        1,
        '13:00:00',
        '15:00:00'
    ),
    (
        'BCOM Economics',
        '102',
        3,
        '09:00:00',
        '11:00:00'
    ),
    -- MCA (Master of Computer Applications) in Room 201
    (
        'MCA Advanced DB',
        '201',
        2,
        '14:00:00',
        '16:00:00'
    ),
    (
        'MCA Cloud Native',
        '201',
        5,
        '10:00:00',
        '13:00:00'
    );