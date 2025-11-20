-- Added wallpaper columns to profiles
ALTER TABLE Profile ADD COLUMN wallpaperUrl VARCHAR(191) NULL, ADD COLUMN wallpaperLock BOOLEAN NOT NULL DEFAULT FALSE;
