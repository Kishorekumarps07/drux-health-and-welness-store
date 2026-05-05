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
}));
