import { create } from "zustand";
import { supabase } from "@/lib/supabase";

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
        supabase.from('hero_slides').select('*').order('created_at', { ascending: true }),
        supabase.from('advantages').select('*').order('created_at', { ascending: true })
      ]);

      const heroData = heroRes.data || [];
      const advData = advRes.data || [];

      set({ 
        heroSlides: heroData.map(s => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          image: s.image,
          bgColor: s.bg_color
        })),
        advantages: advData.map(a => ({
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
            bgColor: "bg-green-100"
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
    const { data, error } = await supabase.from('hero_slides').insert([{
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      bg_color: slide.bgColor
    }]).select();

    if (error) throw error;
    if (data) {
      set((state) => ({
        heroSlides: [...state.heroSlides, { ...slide, id: data[0].id }]
      }));
    }
  },

  updateHeroSlide: async (id, updatedSlide) => {
    const { error } = await supabase.from('hero_slides').update({
      title: updatedSlide.title,
      subtitle: updatedSlide.subtitle,
      image: updatedSlide.image,
      bg_color: updatedSlide.bgColor
    }).eq('id', id);

    if (error) throw error;
    set((state) => ({
      heroSlides: state.heroSlides.map(s => s.id === id ? { ...s, ...updatedSlide } : s)
    }));
  },

  deleteHeroSlide: async (id) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      heroSlides: state.heroSlides.filter(s => s.id !== id)
    }));
  },

  addAdvantage: async (item) => {
    const { data, error } = await supabase.from('advantages').insert([{
      title: item.title,
      description: item.desc,
      image: item.image,
      icon_type: item.iconType
    }]).select();

    if (error) throw error;
    if (data) {
      set((state) => ({
        advantages: [...state.advantages, { ...item, id: data[0].id }]
      }));
    }
  },

  updateAdvantage: async (id, updatedItem) => {
    const { error } = await supabase.from('advantages').update({
      title: updatedItem.title,
      description: updatedItem.desc,
      image: updatedItem.image,
      icon_type: updatedItem.iconType
    }).eq('id', id);

    if (error) throw error;
    set((state) => ({
      advantages: state.advantages.map(a => a.id === id ? { ...a, ...updatedItem } : a)
    }));
  },

  deleteAdvantage: async (id) => {
    const { error } = await supabase.from('advantages').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      advantages: state.advantages.filter(a => a.id !== id)
    }));
  }
}));
