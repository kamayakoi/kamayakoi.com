-- Migration: 15_keepalive_and_pg_cron.sql
-- Purpose: Free-tier keepalive + in-DB cron for expired payment cleanup

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

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Replace schedules if this migration is re-applied
DO $$
DECLARE
  jid bigint;
BEGIN
  FOR jid IN
    SELECT jobid FROM cron.job
    WHERE jobname IN ('kamayakoi-expire-payments', 'kamayakoi-keepalive')
  LOOP
    PERFORM cron.unschedule(jid);
  END LOOP;
END;
$$;

SELECT cron.schedule(
  'kamayakoi-expire-payments',
  '15 */2 * * *',
  $$
  SELECT public.update_expired_pending_payments();
  SELECT public.touch_kamayakoi_keepalive();
  $$
);

SELECT cron.schedule(
  'kamayakoi-keepalive',
  '0 */6 * * *',
  $$SELECT public.touch_kamayakoi_keepalive()$$
);
