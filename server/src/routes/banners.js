import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabase.js';
import { throwIfSupabaseError } from '../lib/supabaseRestError.js';

const router = Router();

router.get(
  '/',
  query('tier').optional().isIn(['free', 'pro', 'business']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid query', errors: errors.array() });
      }
      const { tier } = req.query;

      if (!supabaseAdmin) {
        return res.json({
          banners: [
            {
              id: 'b0000003-0000-4000-8000-000000000003',
              name: 'Webinar',
              tier: 'pro',
              color_count: 6,
              is_active: true,
            },
          ].filter((b) => !tier || b.tier === tier),
        });
      }

      let q = supabaseAdmin.from('banners').select('*').eq('is_active', true);
      if (tier) q = q.eq('tier', tier);
      const { data, error } = await q.order('created_at', { ascending: true });
      throwIfSupabaseError(error);
      res.json({ banners: data || [] });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
