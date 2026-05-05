const { Router } = require('express');

let heroSlides = [
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

let advantages = [
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

// GET
router.get('/hero', (req, res) => res.json({ status: 'success', data: heroSlides }));
router.get('/advantages', (req, res) => res.json({ status: 'success', data: advantages }));

// POST
router.post('/hero', (req, res) => {
  const newSlide = { id: Date.now().toString(), ...req.body };
  heroSlides.push(newSlide);
  res.status(201).json({ status: 'success', data: newSlide });
});

router.post('/advantages', (req, res) => {
  const newAdv = { id: Date.now().toString(), ...req.body };
  advantages.push(newAdv);
  res.status(201).json({ status: 'success', data: newAdv });
});

// PUT
router.put('/hero/:id', (req, res) => {
  const index = heroSlides.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    heroSlides[index] = { ...heroSlides[index], ...req.body };
    return res.json({ status: 'success', data: heroSlides[index] });
  }
  res.status(404).json({ status: 'fail', message: 'Slide not found' });
});

router.put('/advantages/:id', (req, res) => {
  const index = advantages.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    advantages[index] = { ...advantages[index], ...req.body };
    return res.json({ status: 'success', data: advantages[index] });
  }
  res.status(404).json({ status: 'fail', message: 'Advantage not found' });
});

// DELETE
router.delete('/hero/:id', (req, res) => {
  heroSlides = heroSlides.filter(s => s.id !== req.params.id);
  res.status(204).send();
});

router.delete('/advantages/:id', (req, res) => {
  advantages = advantages.filter(a => a.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
