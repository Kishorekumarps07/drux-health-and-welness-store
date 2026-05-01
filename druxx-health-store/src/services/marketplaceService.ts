import { supabase } from "@/lib/supabase";

export const marketplaceService = {
  // 1. Fetch all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // 2. Fetch all products with their categories and vendors
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        vendors (name, slug, is_verified)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // 3. Fetch featured products
  async getFeaturedProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        vendors (name, slug, is_verified)
      `)
      .eq('is_featured', true)
      .limit(8);
    if (error) throw error;
    return data;
  },

  // 4. Fetch a single product by slug
  async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        vendors (name, slug, logo, is_verified, rating)
      `)
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }
};
