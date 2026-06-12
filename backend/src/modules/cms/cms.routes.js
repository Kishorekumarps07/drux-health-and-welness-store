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
  
  // Remove hardcoded defaults so the admin can intentionally delete all items.
  // The database should be the single source of truth.
  res.json({ status: 'success', data: slides });
}));

// GET - Advantages
router.get('/advantages', asyncHandler(async (req, res) => {
  const items = await prisma.advantageItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  // Remove hardcoded defaults so the admin can intentionally delete all items.
  // The database should be the single source of truth.
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
      bgColor: req.body.bgColor || "from-[#1E1E1E] to-[#2CA7A0]",
      redirectUrl: req.body.redirectUrl || null
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
      iconType: req.body.icon_type,
      redirectUrl: req.body.redirectUrl || null
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
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : undefined,
      redirectUrl: req.body.redirectUrl !== undefined ? (req.body.redirectUrl === 'null' || req.body.redirectUrl === '' ? null : req.body.redirectUrl) : undefined
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
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : undefined,
      redirectUrl: req.body.redirectUrl !== undefined ? (req.body.redirectUrl === 'null' || req.body.redirectUrl === '' ? null : req.body.redirectUrl) : undefined
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
