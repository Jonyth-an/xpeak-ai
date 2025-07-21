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
  private getAuthHeaders(session: Session): HeadersInit {
    if (!session?.access_token) {
      throw new Error('No active session found. Please log in again.');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  async getMaterials(session: Session): Promise<Material[]> {
    try {
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
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching materials:', error);
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
      return data.material;
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
      return data.material;
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
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
}

export const materialsService = new MaterialsService(); 