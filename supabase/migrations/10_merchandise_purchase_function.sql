-- Add merchandise columns to purchases table
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS merchandise_id TEXT,
ADD COLUMN IF NOT EXISTS product_id TEXT,
ADD COLUMN IF NOT EXISTS product_title TEXT,
ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;

-- Make event-related columns nullable for merchandise purchases
ALTER TABLE public.purchases
ALTER COLUMN event_id DROP NOT NULL,
ALTER COLUMN ticket_type_id DROP NOT NULL,
ALTER COLUMN ticket_name DROP NOT NULL;

-- Add comments for merchandise columns
COMMENT ON COLUMN public.purchases.merchandise_id IS 'Identifier for merchandise item (for cart-based purchases)';
COMMENT ON COLUMN public.purchases.product_id IS 'Product ID from external system (e.g., Sanity)';
COMMENT ON COLUMN public.purchases.product_title IS 'Title/name of the merchandise product';

-- Create merchandise purchase function
CREATE OR REPLACE FUNCTION public.create_merch_purchase(
    p_customer_id UUID,
    p_product_id TEXT,
    p_product_title TEXT,
    p_quantity INTEGER,
    p_price_per_item NUMERIC,
    p_total_amount NUMERIC,
    p_merchandise_id TEXT,
    p_currency_code TEXT DEFAULT 'XOF',
    p_shipping_fee NUMERIC DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    purchase_id UUID;
BEGIN
    INSERT INTO public.purchases (
        customer_id,
        event_id,  -- Will be null for merchandise
        event_title,  -- Will be null for merchandise
        ticket_type_id,  -- Will be null for merchandise
        ticket_name,  -- Will be null for merchandise
        quantity,
        price_per_ticket,  -- Using this field for merchandise price
        total_amount,
        currency_code,
        merchandise_id,
        product_id,
        product_title,
        status,
        shipping_fee
    )
    VALUES (
        p_customer_id,
        NULL,  -- No event for merchandise
        NULL,  -- No event title for merchandise
        NULL,  -- No ticket type for merchandise
        NULL,  -- No ticket name for merchandise
        p_quantity,
        p_price_per_item,
        p_total_amount,
        p_currency_code,
        p_merchandise_id,
        p_product_id,
        p_product_title,
        'pending_payment',
        p_shipping_fee
    )
    RETURNING id INTO purchase_id;

    RETURN purchase_id;
END;
$$;

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION public.create_merch_purchase(UUID, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT, NUMERIC) TO service_role;

-- Add comments
COMMENT ON FUNCTION public.create_merch_purchase(UUID, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT, NUMERIC)
IS 'Creates a new merchandise purchase record with pending_payment status. Returns purchase ID.';


-- Function to get merchandise purchase details for email dispatch
CREATE OR REPLACE FUNCTION public.get_merch_purchase_for_email_dispatch(
    p_purchase_ids UUID[]
)
RETURNS TABLE (
    customer_name TEXT,
    customer_email TEXT,
    items JSON,
    total_amount NUMERIC,
    shipping_fee NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.name AS customer_name,
        c.email AS customer_email,
        json_agg(
            json_build_object(
                'product_title', p.product_title,
                'quantity', p.quantity,
                'total_amount', p.total_amount
            )
        ) AS items,
        SUM(p.total_amount + p.shipping_fee) AS total_amount,
        SUM(p.shipping_fee) AS shipping_fee
    FROM
        public.purchases p
    JOIN
        public.customers c ON p.customer_id = c.id
    WHERE
        p.id = ANY(p_purchase_ids)
    GROUP BY
        c.name, c.email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_merch_purchase_for_email_dispatch(UUID[]) TO service_role;

COMMENT ON FUNCTION public.get_merch_purchase_for_email_dispatch(UUID[])
IS 'Retrieves details for one or more merchandise purchases to be used in a confirmation email.';
