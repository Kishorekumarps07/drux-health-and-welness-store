const { Router } = require('express');
const { cmsUpload } = require('../../middleware/upload');
const { deleteImageByUrl } = require('../../utils/cloudinary');

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
router.post('/hero', cmsUpload.single('image'), (req, res) => {
  console.log('CMS Hero Upload - File:', req.file);
  console.log('CMS Hero Upload - Body:', req.body);
  const image = req.file ? req.file.path : req.body.image;
  const newSlide = { id: Date.now().toString(), ...req.body, image };
  heroSlides.push(newSlide);
  res.status(201).json({ status: 'success', data: newSlide });
});

router.post('/advantages', cmsUpload.single('image'), (req, res) => {
  console.log('CMS Advantage Upload - File:', req.file);
  console.log('CMS Advantage Upload - Body:', req.body);
  const image = req.file ? req.file.path : req.body.image;
  const newAdv = { id: Date.now().toString(), ...req.body, image };
  advantages.push(newAdv);
  res.status(201).json({ status: 'success', data: newAdv });
});

// PUT
router.put('/hero/:id', cmsUpload.single('image'), async (req, res) => {
  const index = heroSlides.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    const oldImage = heroSlides[index].image;
    const image = req.file ? req.file.path : req.body.image;
    
    // If a new image is provided, delete the old one from Cloudinary
    if (req.file && oldImage) {
      await deleteImageByUrl(oldImage);
    }

    heroSlides[index] = { ...heroSlides[index], ...req.body, ...(image && { image }) };
    return res.json({ status: 'success', data: heroSlides[index] });
  }
  res.status(404).json({ status: 'fail', message: 'Slide not found' });
});

router.put('/advantages/:id', cmsUpload.single('image'), async (req, res) => {
  const index = advantages.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    const oldImage = advantages[index].image;
    const image = req.file ? req.file.path : req.body.image;
    
    if (req.file && oldImage) {
      await deleteImageByUrl(oldImage);
    }

    advantages[index] = { ...advantages[index], ...req.body, ...(image && { image }) };
    return res.json({ status: 'success', data: advantages[index] });
  }
  res.status(404).json({ status: 'fail', message: 'Advantage not found' });
});

// DELETE
router.delete('/hero/:id', async (req, res) => {
  const index = heroSlides.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    const image = heroSlides[index].image;
    if (image) await deleteImageByUrl(image);
    heroSlides.splice(index, 1);
  }
  res.status(204).send();
});

router.delete('/advantages/:id', async (req, res) => {
  const index = advantages.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    const image = advantages[index].image;
    if (image) await deleteImageByUrl(image);
    advantages.splice(index, 1);
  }
  res.status(204).send();
});

module.exports = router;
