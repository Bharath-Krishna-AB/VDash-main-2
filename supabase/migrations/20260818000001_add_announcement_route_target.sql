-- Migration: add_announcement_route_target

ALTER TABLE announcements
ADD COLUMN route_id uuid REFERENCES routes(id) NULL;
