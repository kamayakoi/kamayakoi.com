-- Prod cron: ensure payment-expiry function exists, run it, and touch keepalive.
-- Safe to re-run (idempotent). Intended for GitHub Actions every 2 hours.

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

  RAISE LOG 'Starting expired payments cleanup. Threshold: %', expiry_threshold;

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

  RAISE LOG 'Expired payments cleanup completed. Updated % purchases: %',
    update_count, updated_ids;

  RETURN QUERY SELECT update_count, updated_ids;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_expired_pending_payments() TO service_role;

COMMENT ON FUNCTION public.update_expired_pending_payments() IS
'Updates pending payments older than 2 hours to failed status.
Called automatically by scheduled job every 2 hours.
Returns count of affected rows and list of updated purchase IDs.';

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

-- Run cleanup
SELECT * FROM public.update_expired_pending_payments();

-- Keep free-tier project active (write activity)
CREATE TABLE IF NOT EXISTS public._kamayakoi_keepalive (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_ping timestamptz NOT NULL DEFAULT now(),
  ping_count bigint NOT NULL DEFAULT 0
);

INSERT INTO public._kamayakoi_keepalive (id, last_ping, ping_count)
VALUES (1, now(), 1)
ON CONFLICT (id) DO UPDATE
SET last_ping = excluded.last_ping,
    ping_count = public._kamayakoi_keepalive.ping_count + 1;

SELECT last_ping, ping_count FROM public._kamayakoi_keepalive WHERE id = 1;
SELECT status, count FROM public.payment_status_summary;
