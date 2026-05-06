const { Router } = require('express');
const { cmsUpload } = require('../../middleware/upload');
const { deleteImageByUrl } = require('../../utils/cloudinary');
const prisma = require('../../lib/prisma');
const asyncHandler = require('../../lib/asyncHandler');

const router = Router();

// GET - Hero Slides
router.get('/hero', asyncHandler(async (req, res) => {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });
  
  // If empty, return initial defaults (but don't save them to DB yet to avoid duplicates)
  if (slides.length === 0) {
    const defaults = [
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
    return res.json({ status: 'success', data: defaults });
  }

  res.json({ status: 'success', data: slides });
}));

// GET - Advantages
router.get('/advantages', asyncHandler(async (req, res) => {
  const items = await prisma.advantageItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  if (items.length === 0) {
    const defaults = [
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
    return res.json({ status: 'success', data: defaults });
  }

  res.json({ status: 'success', data: items });
}));

// POST - Hero
router.post('/hero', cmsUpload.single('image'), asyncHandler(async (req, res) => {
  const image = req.file ? req.file.path : req.body.image;
  
  if (!image) {
    return res.status(400).json({ status: 'fail', message: 'Image is required for a new slide' });
  }

  const slide = await prisma.heroSlide.create({
    data: {
      title: req.body.title,
      subtitle: req.body.subtitle,
      image,
      bgColor: req.body.bgColor || "from-[#1E1E1E] to-[#2CA7A0]"
    }
  });

  res.status(201).json({ status: 'success', data: slide });
}));

// POST - Advantages
router.post('/advantages', cmsUpload.single('image'), asyncHandler(async (req, res) => {
  const image = req.file ? req.file.path : req.body.image;

  const item = await prisma.advantageItem.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      image,
      iconType: req.body.icon_type
    }
  });

  res.status(201).json({ status: 'success', data: item });
}));

// PUT - Hero
router.put('/hero/:id', cmsUpload.single('image'), asyncHandler(async (req, res) => {
  const oldSlide = await prisma.heroSlide.findUnique({ where: { id: req.params.id } });
  
  if (!oldSlide) {
    return res.status(404).json({ status: 'fail', message: 'Slide not found' });
  }

  const image = req.file ? req.file.path : req.body.image;

  if (req.file && oldSlide.image && oldSlide.image.startsWith('http')) {
    await deleteImageByUrl(oldSlide.image);
  }

  const updated = await prisma.heroSlide.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: image || undefined,
      bgColor: req.body.bgColor,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : undefined
    }
  });

  res.json({ status: 'success', data: updated });
}));

// PUT - Advantages
router.put('/advantages/:id', cmsUpload.single('image'), asyncHandler(async (req, res) => {
  const oldItem = await prisma.advantageItem.findUnique({ where: { id: req.params.id } });

  if (!oldItem) {
    return res.status(404).json({ status: 'fail', message: 'Advantage item not found' });
  }

  const image = req.file ? req.file.path : req.body.image;

  if (req.file && oldItem.image && oldItem.image.startsWith('http')) {
    await deleteImageByUrl(oldItem.image);
  }

  const updated = await prisma.advantageItem.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      description: req.body.description,
      image: image || undefined,
      iconType: req.body.icon_type,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : undefined
    }
  });

  res.json({ status: 'success', data: updated });
}));

// DELETE - Hero
router.delete('/hero/:id', asyncHandler(async (req, res) => {
  const slide = await prisma.heroSlide.findUnique({ where: { id: req.params.id } });
  
  if (slide) {
    if (slide.image && slide.image.startsWith('http')) {
      await deleteImageByUrl(slide.image);
    }
    await prisma.heroSlide.delete({ where: { id: req.params.id } });
  }
  
  res.status(204).send();
}));

// DELETE - Advantages
router.delete('/advantages/:id', asyncHandler(async (req, res) => {
  const item = await prisma.advantageItem.findUnique({ where: { id: req.params.id } });

  if (item) {
    if (item.image && item.image.startsWith('http')) {
      await deleteImageByUrl(item.image);
    }
    await prisma.advantageItem.delete({ where: { id: req.params.id } });
  }

  res.status(204).send();
}));

module.exports = router;
