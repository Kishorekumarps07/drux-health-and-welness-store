import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

export const categoryService = {
  /**
   * Fetch all categories
   */
  async getAllCategories() {
    try {
      const { default: api } = await import("@/lib/api");
      const response = await api.get('/categories');
      
      // Handle different response formats (backend vs direct supabase)
      const data = response.data.data || response.data;
      
      // Map the count from the backend's _count property
      const categoriesWithCount = (data.categories || data || []).map((cat: any) => ({
        ...cat,
        productCount: cat._count?.products || 0
      }));

      return { categories: categoriesWithCount };
    } catch (error) {
      console.error("Error fetching categories from backend:", error);
      // Fallback or return empty
      return { categories: [] };
    }
  },

  /**
   * Create a new category
   */
  async createCategory(category: { name: string; slug: string; icon?: string }) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        id: crypto.randomUUID(),
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
