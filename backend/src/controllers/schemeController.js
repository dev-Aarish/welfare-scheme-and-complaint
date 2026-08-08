import * as SchemeModel from '../models/schemeModel.js';
import { runSchemeSync } from '../jobs/schemeSyncJob.js';

export const fetchCategories = async (req, res) => {
  try {
    const categories = await SchemeModel.getCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching scheme categories:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

export const fetchSchemes = async (req, res) => {
  try {
    const { category, search, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);

    const { schemes, totalCount } = await SchemeModel.findSchemes({
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      page: pageNum,
      limit: limitNum
    });

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
      data: schemes
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch schemes catalog'
    });
  }
};

export const fetchSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const scheme = await SchemeModel.findSchemeById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    console.error(`Error fetching scheme ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scheme details'
    });
  }
};

export const addScheme = async (req, res) => {
  try {
    const { title, category, tag, description, benefit, eligibility, sourceUrl } = req.body;

    if (!title || !category || !description || !benefit || !eligibility) {
      return res.status(400).json({
        success: false,
        error: 'Title, category, description, benefit, and eligibility are required fields.'
      });
    }

    const externalId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newScheme = await SchemeModel.createScheme({
      externalId,
      source: 'admin',
      sourceUrl: sourceUrl || null,
      title,
      category,
      tag: tag || category,
      description,
      benefit,
      eligibility
    });

    return res.status(201).json({
      success: true,
      data: newScheme
    });
  } catch (error) {
    console.error('Error creating scheme:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create scheme'
    });
  }
};

export const triggerSync = async (req, res) => {
  try {
    const count = await runSchemeSync();
    return res.status(200).json({
      success: true,
      message: `Sync completed successfully. Upserted ${count} schemes.`,
      count
    });
  } catch (error) {
    console.error('Error executing scheme sync:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to execute scheme sync job'
    });
  }
};
