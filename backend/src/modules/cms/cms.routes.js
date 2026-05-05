const { Router } = require('express');

const heroSlides = [
  {
    id: "h1",
    title: "Premium Health\nSupplements.",
    subtitle: "Fuel your performance with the highest quality whey, creatine, and vitamins.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000",
    bgColor: "from-[#1E1E1E] to-[#2CA7A0]"
  },
  {
    id: "h2",
    title: "100% Authentic\nBrands.",
    subtitle: "We partner directly with manufacturers to guarantee genuine products.",
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2000",
    bgColor: "from-[#A6D608] to-[#2CA7A0]"
  }
];

const advantages = [
  {
    id: "a1",
    title: "Certified Pure",
    description: "Every product is lab-tested and certified for purity and safety.",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800",
    icon_type: "shield"
  },
  {
    id: "a2",
    title: "Fast Delivery",
    description: "Experience lightning-fast shipping across India within 48 hours.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800",
    icon_type: "zap"
  }
];

const router = Router();

router.get('/hero', (req, res) => {
  res.json({ status: 'success', data: heroSlides });
});

router.get('/advantages', (req, res) => {
  res.json({ status: 'success', data: advantages });
});

module.exports = router;
