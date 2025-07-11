-- Migration: Lowercase all role values in user_roles
UPDATE user_roles SET role = LOWER(role) WHERE role <> LOWER(role); 