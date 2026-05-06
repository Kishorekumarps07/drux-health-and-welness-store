import { create } from "zustand";
import api from "@/lib/api";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
}

export interface AdvantageItem {
  id: string;
  title: string;
  desc: string;
  image: string;
  iconType: string;
}

interface CMSState {
  heroSlides: HeroSlide[];
  advantages: AdvantageItem[];
  loading: boolean;

  // Global Actions
  fetchCMSData: () => Promise<void>;
  
  // Hero Actions
  addHeroSlide: (slide: Omit<HeroSlide, "id">) => Promise<void>;
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;

  // Advantage Actions
  addAdvantage: (item: Omit<AdvantageItem, "id">) => Promise<void>;
  updateAdvantage: (id: string, item: Partial<AdvantageItem>) => Promise<void>;
  deleteAdvantage: (id: string) => Promise<void>;
}

export const useCMSStore = create<CMSState>((set, get) => ({
  heroSlides: [],
  advantages: [],
  loading: false,

  fetchCMSData: async () => {
    set({ loading: true });
    try {
      const [heroRes, advRes] = await Promise.all([
        api.get('/cms/hero'),
        api.get('/cms/advantages')
      ]);

      set({ 
        heroSlides: heroRes.data.data || [],
        advantages: (advRes.data.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          desc: a.description,
          image: a.image,
          iconType: a.icon_type
        }))
      });
    } catch (error) {
      console.error("Error fetching CMS data:", error);
      // Fallbacks
      set({
        heroSlides: [
          {
            id: "default-slide",
            title: "Your Health, Elevated",
            subtitle: "Discover premium health & wellness brands.",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000",
            bgColor: "from-green-100 to-green-200"
          }
        ],
        advantages: [
          {
            id: "adv-1",
            title: "100% Original",
            desc: "Directly sourced from trusted official brands.",
            image: "",
            iconType: "shield"
          }
        ]
      });
    } finally {
      set({ loading: false });
    }
  },

  addHeroSlide: async (slide) => {
    let payload = slide;
    const config = (payload instanceof FormData) 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};
    
    const { data } = await api.post('/cms/hero', payload, config);
    set((state) => ({ heroSlides: [...state.heroSlides, data.data] }));
  },

  updateHeroSlide: async (id, updatedSlide) => {
    let payload = updatedSlide;
    const config = (payload instanceof FormData) 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};

    const { data } = await api.put(`/cms/hero/${id}`, payload, config);
    set((state) => ({
      heroSlides: state.heroSlides.map(s => s.id === id ? data.data : s)
    }));
  },

  deleteHeroSlide: async (id) => {
    await api.delete(`/cms/hero/${id}`);
    set((state) => ({
      heroSlides: state.heroSlides.filter(s => s.id !== id)
    }));
  },

  addAdvantage: async (item) => {
    let payload;
    if (item instanceof FormData) {
      payload = item;
      // Handle field name mapping if needed (desc -> description, iconType -> icon_type)
      // For FormData, we should ideally have done this in the component, 
      // but let's ensure consistency here if possible or just pass through.
    } else {
      payload = {
        title: item.title,
        description: item.desc,
        image: item.image,
        icon_type: item.iconType
      };
    }
    
    const config = (payload instanceof FormData) 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};

    const { data } = await api.post('/cms/advantages', payload, config);
    set((state) => ({
      advantages: [...state.advantages, {
        id: data.data.id,
        title: data.data.title,
        desc: data.data.description,
        image: data.data.image,
        iconType: data.data.icon_type
      }]
    }));
  },

  updateAdvantage: async (id, updatedItem) => {
    let payload;
    if (updatedItem instanceof FormData) {
      payload = updatedItem;
    } else {
      payload = {
        title: updatedItem.title,
        description: updatedItem.desc,
        image: updatedItem.image,
        icon_type: updatedItem.iconType
      };
    }

    const config = (payload instanceof FormData) 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};

    const { data } = await api.put(`/cms/advantages/${id}`, payload, config);
    set((state) => ({
      advantages: state.advantages.map(a => a.id === id ? {
        id: data.data.id,
        title: data.data.title,
        desc: data.data.description,
        image: data.data.image,
        iconType: data.data.icon_type
      } : a)
    }));
  },

  deleteAdvantage: async (id) => {
    await api.delete(`/cms/advantages/${id}`);
    set((state) => ({
      advantages: state.advantages.filter(a => a.id !== id)
    }));
  }
}));
