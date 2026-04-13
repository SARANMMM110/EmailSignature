import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { throwIfSupabaseError } from '../lib/supabaseRestError.js';

const router = Router();

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function validateFourHexColors(colors) {
  if (!Array.isArray(colors) || colors.length !== 4) return false;
  return colors.every((c) => typeof c === 'string' && HEX.test(c.trim()));
}

router.get('/system', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ palettes: [] });
    }
    const { data, error } = await supabaseAdmin
      .from('system_palettes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.warn('[palettes/system]', error.message);
      return res.json({ palettes: [] });
    }
    res.json({ palettes: data || [] });
  } catch (e) {
    next(e);
  }
});

router.get('/user', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_palettes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    throwIfSupabaseError(error);
    res.json({ palettes: data || [] });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/user',
  requireAuth,
  body('name').trim().notEmpty().withMessage('name is required'),
  body('colors').isArray({ min: 4, max: 4 }).withMessage('colors must be an array of 4 hex strings'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      if (!validateFourHexColors(req.body.colors)) {
        return res.status(400).json({ message: 'Each color must be a valid #RGB or #RRGGBB hex' });
      }
      const row = {
        user_id: req.user.id,
        name: req.body.name.trim(),
        colors: req.body.colors.map((c) => c.trim()),
      };
      const { data, error } = await supabaseAdmin
        .from('user_palettes')
        .insert(row)
        .select('*')
        .single();
      throwIfSupabaseError(error);
      res.status(201).json({ palette: data });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/user/:id',
  requireAuth,
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
      }
      const { data, error } = await supabaseAdmin
        .from('user_palettes')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select('id');
      throwIfSupabaseError(error);
      if (!data?.length) return res.status(404).json({ message: 'Palette not found' });
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
