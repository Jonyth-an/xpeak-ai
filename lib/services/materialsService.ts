import { Session } from '@supabase/supabase-js';

export interface Material {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  url: string;
  tags: string[];
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialData {
  title: string;
  description?: string;
  url: string;
  tags?: string[];
  fileType?: string;
  fileSize?: number;
}

export interface UpdateMaterialData extends CreateMaterialData {
  id: string;
}

class MaterialsService {
  private cacheKey = 'materials_cache';
  private lastSyncKey = 'materials_last_sync';
  private syncInterval = 5 * 60 * 1000; // 5 minutes

  // Cache management
  private getCache(): Material[] {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error reading cache:', error);
      return [];
    }
  }

  private setCache(materials: Material[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(materials));
      localStorage.setItem(this.lastSyncKey, Date.now().toString());
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  }

  private shouldSync(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const lastSync = localStorage.getItem(this.lastSyncKey);
      if (!lastSync) return true;
      return Date.now() - parseInt(lastSync) > this.syncInterval;
    } catch (error) {
      return true;
    }
  }

  private getAuthHeaders(session: Session): HeadersInit {
    if (!session?.access_token) {
      throw new Error('No active session found. Please log in again.');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  async getMaterials(session: Session, forceSync = false): Promise<Material[]> {
    try {
      // Return cached data immediately if not forcing sync
      if (!forceSync && !this.shouldSync()) {
        const cached = this.getCache();
        if (cached.length > 0) {
          console.log('Returning cached materials:', cached.length);
          return cached;
        }
      }

      // Fetch from server
      const headers = this.getAuthHeaders(session);
      const response = await fetch('/api/materials', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch materials');
      }

      const data = await response.json();
      const materials = data.materials || [];
      
      // Update cache
      this.setCache(materials);
      console.log('Synced materials from server:', materials.length);
      
      return materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      
      // Return cached data as fallback
      const cached = this.getCache();
      if (cached.length > 0) {
        console.log('Returning cached materials as fallback:', cached.length);
        return cached;
      }
      
      throw error;
    }
  }

  async createMaterial(materialData: CreateMaterialData, session: Session): Promise<Material> {
    try {
      const headers = this.getAuthHeaders(session);
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers,
        body: JSON.stringify(materialData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create material');
      }

      const data = await response.json();
      const newMaterial = data.material;

      // Optimistic cache update
      const cached = this.getCache();
      this.setCache([newMaterial, ...cached]);

      return newMaterial;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  async updateMaterial(materialData: UpdateMaterialData, session: Session): Promise<Material> {
    try {
      const headers = this.getAuthHeaders(session);
      const response = await fetch(`/api/materials/${materialData.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(materialData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update material');
      }

      const data = await response.json();
      const updatedMaterial = data.material;

      // Optimistic cache update
      const cached = this.getCache();
      const updatedCache = cached.map(m => m.id === updatedMaterial.id ? updatedMaterial : m);
      this.setCache(updatedCache);

      return updatedMaterial;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  async deleteMaterial(id: string, session: Session): Promise<void> {
    try {
      const headers = this.getAuthHeaders(session);
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete material');
      }

      // Optimistic cache update
      const cached = this.getCache();
      const updatedCache = cached.filter(m => m.id !== id);
      this.setCache(updatedCache);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  // Background sync method
  async backgroundSync(session: Session): Promise<void> {
    try {
      await this.getMaterials(session, true);
      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  // Clear cache (useful for logout)
  clearCache(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(this.lastSyncKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache stats
  getCacheStats(): { count: number; lastSync: number | null } {
    if (typeof window === 'undefined') return { count: 0, lastSync: null };
    try {
      const cached = this.getCache();
      const lastSync = localStorage.getItem(this.lastSyncKey);
      return {
        count: cached.length,
        lastSync: lastSync ? parseInt(lastSync) : null
      };
    } catch (error) {
      return { count: 0, lastSync: null };
    }
  }
}

export const materialsService = new MaterialsService(); 