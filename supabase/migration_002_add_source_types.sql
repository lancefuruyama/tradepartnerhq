-- =============================================================
-- Migration 002: Add new source_types for expanded scrapers
-- Run this in Supabase SQL Editor BEFORE running the new scrapers
-- =============================================================

-- Drop the existing CHECK constraint on source_type
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_source_type_check;

-- Re-add with expanded source types
ALTER TABLE events ADD CONSTRAINT events_source_type_check
  CHECK (source_type IN (
    'sbe_dbe',
    'linkedin_company',
    'linkedin_personal',
    'trade_association',
    'government',
    'gc_website',
    'eventbrite',
    'abc_chapter'
  ));
