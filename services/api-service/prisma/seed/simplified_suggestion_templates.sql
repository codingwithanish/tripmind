-- Simplified Suggestion Templates
-- Delete old templates first (optional - uncomment if needed)
-- DELETE FROM public.suggestion_templates;

-- Template 1: Short International Trip (3-5 days)
INSERT INTO public.suggestion_templates(
    id, priority, template_text, description, display_type, category, 
    locality_lat, locality_lng, locality_radius_km, placeholder_options, 
    is_active, created_at, updated_at)
VALUES (
    'a1b2c3d4-1111-4000-8000-000000000001'::uuid,
    1,
    'I want to do a **{{duration}} day** international trip to **{{destination}}**',
    'Short international trip suggestion',
    'all',
    'short_time_plan',
    NULL,
    NULL,
    1000,
    '[{"name": "duration", "type": "string", "options": ["3", "4", "5"], "required": true}, {"name": "destination", "type": "string", "options": ["Dubai", "Tokyo", "Singapore"], "required": true}]'::jsonb,
    true,
    NOW(),
    NOW()
);

-- Template 2: Medium International Trip (7-10 days)
INSERT INTO public.suggestion_templates(
    id, priority, template_text, description, display_type, category, 
    locality_lat, locality_lng, locality_radius_km, placeholder_options, 
    is_active, created_at, updated_at)
VALUES (
    'a1b2c3d4-2222-4000-8000-000000000002'::uuid,
    2,
    'Plan a **{{duration}} day** adventure to **{{destination}}**',
    'Medium international trip suggestion',
    'all',
    'long_time_plan',
    NULL,
    NULL,
    1000,
    '[{"name": "duration", "type": "string", "options": ["7", "10", "14"], "required": true}, {"name": "destination", "type": "string", "options": ["Dubai", "Tokyo", "Australia"], "required": true}]'::jsonb,
    true,
    NOW(),
    NOW()
);

-- Template 3: Weekend Quick Trip (2-3 days)
INSERT INTO public.suggestion_templates(
    id, priority, template_text, description, display_type, category, 
    locality_lat, locality_lng, locality_radius_km, placeholder_options, 
    is_active, created_at, updated_at)
VALUES (
    'a1b2c3d4-3333-4000-8000-000000000003'::uuid,
    3,
    'Quick **{{duration}} day** getaway to **{{destination}}**',
    'Weekend quick trip suggestion',
    'all',
    'weekend_plan',
    NULL,
    NULL,
    1000,
    '[{"name": "duration", "type": "string", "options": ["2", "3"], "required": true}, {"name": "destination", "type": "string", "options": ["Dubai", "Singapore", "Maldives"], "required": true}]'::jsonb,
    true,
    NOW(),
    NOW()
);

-- Template 4: Budget Trip
INSERT INTO public.suggestion_templates(
    id, priority, template_text, description, display_type, category, 
    locality_lat, locality_lng, locality_radius_km, placeholder_options, 
    is_active, created_at, updated_at)
VALUES (
    'a1b2c3d4-4444-4000-8000-000000000004'::uuid,
    4,
    '**{{duration}} day** budget trip to **{{destination}}**',
    'Budget international trip suggestion',
    'all',
    'quick_trip',
    NULL,
    NULL,
    1000,
    '[{"name": "duration", "type": "string", "options": ["4", "5", "7"], "required": true}, {"name": "destination", "type": "string", "options": ["Dubai", "Thailand", "Bali"], "required": true}]'::jsonb,
    true,
    NOW(),
    NOW()
);

-- Deactivate old templates (optional - run this to hide old ones without deleting)
-- UPDATE public.suggestion_templates SET is_active = false 
-- WHERE id IN (
--     '6282caa2-4191-4f42-9b5a-4f9eefc4089b',
--     'a0a8b3c8-6ae6-46a4-bb07-7150608959af',
--     '87047805-b558-4bc6-88c5-1dba06816f39',
--     '20f0d8b4-bb16-4d16-a888-9af312eab484'
-- );
