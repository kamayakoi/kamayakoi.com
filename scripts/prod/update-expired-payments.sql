-- Paste into Supabase Dashboard → SQL Editor → Run
-- Idempotent: safe to re-run anytime.

-- 1) Expire stuck pending payments (> 2 hours)
CREATE OR REPLACE FUNCTION public.update_expired_pending_payments()
RETURNS TABLE(
  affected_rows INTEGER,
  updated_purchase_ids TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_ids TEXT[] := '{}';
  update_count INTEGER := 0;
  expiry_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  expiry_threshold := NOW() - INTERVAL '2 hours';

  WITH updated_purchases AS (
    UPDATE public.purchases
    SET
      status = 'payment_failed',
      updated_at = NOW()
    WHERE
      status = 'pending_payment'
      AND created_at < expiry_threshold
    RETURNING id
  )
  SELECT
    ARRAY(SELECT id::text FROM updated_purchases),
    (SELECT COUNT(*) FROM updated_purchases)
  INTO updated_ids, update_count;

  RETURN QUERY SELECT update_count, updated_ids;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_expired_pending_payments() TO service_role;

CREATE OR REPLACE VIEW public.payment_status_summary
WITH (security_invoker = on)
AS
SELECT
  status,
  COUNT(*) AS count,
  MIN(created_at) AS oldest_payment,
  MAX(created_at) AS newest_payment
FROM public.purchases
GROUP BY status
ORDER BY count DESC;

GRANT SELECT ON public.payment_status_summary TO service_role;

-- 2) Keepalive row (free-tier activity)
CREATE TABLE IF NOT EXISTS public._kamayakoi_keepalive (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_ping timestamptz NOT NULL DEFAULT now(),
  ping_count bigint NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.touch_kamayakoi_keepalive()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public._kamayakoi_keepalive (id, last_ping, ping_count)
  VALUES (1, now(), 1)
  ON CONFLICT (id) DO UPDATE
  SET last_ping = excluded.last_ping,
      ping_count = public._kamayakoi_keepalive.ping_count + 1;
$$;

-- 3) Schedule inside the DB (no GitHub / no direct connection needed)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Clear old job names if re-running
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN ('kamayakoi-expire-payments', 'kamayakoi-keepalive');

-- Every 2 hours: expire pending payments + touch keepalive
SELECT cron.schedule(
  'kamayakoi-expire-payments',
  '15 */2 * * *',
  $$
  SELECT public.update_expired_pending_payments();
  SELECT public.touch_kamayakoi_keepalive();
  $$
);

-- Every 6 hours: extra keepalive write
SELECT cron.schedule(
  'kamayakoi-keepalive',
  '0 */6 * * *',
  $$SELECT public.touch_kamayakoi_keepalive()$$
);

-- 4) Run once now
SELECT * FROM public.update_expired_pending_payments();
SELECT public.touch_kamayakoi_keepalive();

-- 5) Sanity checks
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
SELECT last_ping, ping_count FROM public._kamayakoi_keepalive WHERE id = 1;
SELECT * FROM public.payment_status_summary;
