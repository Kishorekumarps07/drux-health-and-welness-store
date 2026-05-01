const categoriesService = require('./categories.service');
const asyncHandler = require('../../lib/asyncHandler');

const list    = asyncHandler(async (req, res) => {
  const categories = await categoriesService.list();
  res.json({ status: 'success', results: categories.length, data: { categories } });
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoriesService.getById(req.params.id);
  res.json({ status: 'success', data: { category } });
});

const create  = asyncHandler(async (req, res) => {
  const category = await categoriesService.create(req.body);
  res.status(201).json({ status: 'success', data: { category } });
});

const update  = asyncHandler(async (req, res) => {
  const category = await categoriesService.update(req.params.id, req.body);
  res.json({ status: 'success', data: { category } });
});

const remove  = asyncHandler(async (req, res) => {
  await categoriesService.delete(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
