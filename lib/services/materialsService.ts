import { createClient } from '@supabase/supabase-js';

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
  private async getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No active session found');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  async getMaterials(): Promise<Material[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch('/api/materials', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch materials');
      }

      const data = await response.json();
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  async createMaterial(materialData: CreateMaterialData): Promise<Material> {
    try {
      const headers = await this.getAuthHeaders();
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
      return data.material;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  async updateMaterial(materialData: UpdateMaterialData): Promise<Material> {
    try {
      const headers = await this.getAuthHeaders();
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
      return data.material;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
}

export const materialsService = new MaterialsService(); 