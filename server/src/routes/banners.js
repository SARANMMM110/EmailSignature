import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabase.js';
import { throwIfSupabaseError } from '../lib/supabaseRestError.js';
import { mergeEditorBannerCatalog } from '../lib/editorBanners.js';
import { BANNER_SLUG_TO_UUID } from '../lib/templateIds.js';

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
        const offline = mergeEditorBannerCatalog([
          {
            id: BANNER_SLUG_TO_UUID.webinar,
            name: 'Webinar',
            tier: 'pro',
            color_count: 6,
            is_active: true,
          },
        ]);
        return res.json({
          banners: offline.filter((b) => !tier || b.tier === tier),
        });
      }

      let q = supabaseAdmin.from('banners').select('*').eq('is_active', true);
      if (tier) q = q.eq('tier', tier);
      const { data, error } = await q.order('created_at', { ascending: true });
      throwIfSupabaseError(error);
      const merged = mergeEditorBannerCatalog(data);
      const banners = tier ? merged.filter((b) => b.tier === tier) : merged;
      res.json({ banners });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
