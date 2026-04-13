import { Router } from 'express';

const router = Router();

/** Health check for auth service wiring; clients use Supabase directly for login. */
router.get('/session-hint', (req, res) => {
  res.json({
    ok: true,
    hint: 'Use Supabase Auth on the client; send Bearer access_token with API requests.',
  });
});

export default router;
