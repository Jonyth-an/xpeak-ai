import { supabase } from '@/lib/supabaseClient';

export interface ThemePreferences {
  theme_preference: string;
  custom_theme_data: any;
  theme_updated_at: string | null;
}

export class ThemeDatabaseService {
  /**
   * Get user's theme preferences from database
   */
  static async getUserThemePreferences(): Promise<ThemePreferences | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('No authenticated user found for theme preferences');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference, custom_theme_data, theme_updated_at')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching theme preferences:', error);
        return null;
      }

      // If no profile exists, return default values
      if (!data) {
        return {
          theme_preference: 'system',
          custom_theme_data: null,
          theme_updated_at: null
        };
      }

      return {
        theme_preference: data?.theme_preference || 'system',
        custom_theme_data: data?.custom_theme_data || null,
        theme_updated_at: data?.theme_updated_at || null
      };
    } catch (error) {
      console.error('Error in getUserThemePreferences:', error);
      return null;
    }
  }

  /**
   * Update user's theme preferences in database
   */
  static async updateUserThemePreferences(
    themePreference: string, 
    customThemeData?: any
  ): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('No authenticated user found for theme update');
        return false;
      }

      console.log('Attempting to update theme preferences for user:', user.id);
      console.log('Theme preference:', themePreference);
      console.log('Custom theme data:', customThemeData);

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          theme_preference: themePreference,
          custom_theme_data: customThemeData || null,
          theme_updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating theme preferences:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('Theme preferences updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateUserThemePreferences:', error);
      return false;
    }
  }

  /**
   * Sync theme preferences to database (called when user changes theme)
   */
  static async syncThemeToDatabase(
    theme: string, 
    customTheme?: any
  ): Promise<void> {
    try {
      console.log('Syncing theme to database:', { theme, customTheme });
      const success = await this.updateUserThemePreferences(theme, customTheme);
      if (success) {
        console.log('Theme preferences synced to database');
      } else {
        console.warn('Failed to sync theme preferences to database');
      }
    } catch (error) {
      console.error('Error syncing theme to database:', error);
    }
  }

  /**
   * Load theme preferences from database on app startup
   */
  static async loadThemeFromDatabase(): Promise<{
    theme: string;
    customTheme: any;
  } | null> {
    try {
      const preferences = await this.getUserThemePreferences();
      if (!preferences) {
        return null;
      }

      return {
        theme: preferences.theme_preference,
        customTheme: preferences.custom_theme_data
      };
    } catch (error) {
      console.error('Error loading theme from database:', error);
      return null;
    }
  }

  /**
   * Check if user has theme preferences in database
   */
  static async hasStoredPreferences(): Promise<boolean> {
    try {
      const preferences = await this.getUserThemePreferences();
      return preferences !== null;
    } catch (error) {
      console.error('Error checking stored preferences:', error);
      return false;
    }
  }

  /**
   * Check if the profiles table has the required theme columns
   */
  static async checkTableSchema(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_preference, custom_theme_data, theme_updated_at')
        .limit(1);

      if (error) {
        console.error('Schema check failed:', error);
        return false;
      }

      console.log('Profiles table schema check passed');
      return true;
    } catch (error) {
      console.error('Error checking table schema:', error);
      return false;
    }
  }
} 