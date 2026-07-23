-- ==========================================
-- CeliteCreators Seed Data
-- Seed: supabase/seed.sql
-- ==========================================

-- 1. Insert Core Categories
INSERT INTO public.categories (id, name, slug, description, icon_name)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Video Templates', 'video-templates', 'Motion graphics, intro openers, titles, transitions, logo reveals', 'Video'),
    ('c0000000-0000-0000-0000-000000000002', '3D Models & Assets', '3d-models', 'Textured 3D meshes, Blender scenes, characters, environment props', 'Box'),
    ('c0000000-0000-0000-0000-000000000003', 'Audio & SFX', 'audio-sfx', 'Royalty-free background music, cinematic sound effects, foley', 'Music'),
    ('c0000000-0000-0000-0000-000000000004', 'Graphics & UI', 'graphics-ui', 'Figma UI kits, social media templates, vector icons, mockups', 'Layout')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Subcategories
INSERT INTO public.subcategories (category_id, name, slug)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'After Effects Projects', 'after-effects'),
    ('c0000000-0000-0000-0000-000000000001', 'Premiere Pro MOGRTs', 'premiere-pro'),
    ('c0000000-0000-0000-0000-000000000002', 'Blender Low Poly', 'blender-assets'),
    ('c0000000-0000-0000-0000-000000000003', 'Cinematic SFX Packs', 'cinematic-sfx'),
    ('c0000000-0000-0000-0000-000000000004', 'Figma Mobile App Kits', 'figma-kits')
ON CONFLICT (slug) DO NOTHING;
