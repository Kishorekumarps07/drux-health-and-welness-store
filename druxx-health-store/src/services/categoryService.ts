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
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      console.error("Supabase Error fetching categories:", error);
      return { categories: [] };
    }
    return { categories: data };
  }
};
