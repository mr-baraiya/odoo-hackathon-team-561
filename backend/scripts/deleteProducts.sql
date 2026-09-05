-- Script to delete products with cleanup of related records
-- Product UUIDs to delete
DO $$
DECLARE
    product_ids uuid[] := ARRAY[
        '6ccd8eec-d5ed-4f5c-8682-e42f42383ef1'::uuid
    ];
    product_id uuid;
    deleted_barcodes integer;
    deleted_prices integer;
    deleted_products integer;
    product_name text;
BEGIN
    -- Begin transaction
    BEGIN
        -- Loop through each product ID
        FOREACH product_id IN ARRAY product_ids
        LOOP
            RAISE NOTICE 'Processing product: %', product_id;

            -- 1. Delete barcodes for this product
            DELETE FROM barcodes WHERE product_id = product_id;
            GET DIAGNOSTICS deleted_barcodes = ROW_COUNT;
            RAISE NOTICE 'Deleted % barcodes', deleted_barcodes;

            -- 2. Delete party_product_prices for this product
            DELETE FROM party_product_prices WHERE product_id = product_id;
            GET DIAGNOSTICS deleted_prices = ROW_COUNT;
            RAISE NOTICE 'Deleted % party product prices', deleted_prices;

            -- 3. Get product name before deletion
            SELECT name INTO product_name FROM products WHERE id = product_id;

            -- 4. Delete the product
            DELETE FROM products WHERE id = product_id;
            GET DIAGNOSTICS deleted_products = ROW_COUNT;

            IF deleted_products > 0 THEN
                RAISE NOTICE 'Successfully deleted product: %', product_name;
            ELSE
                RAISE NOTICE 'Product % not found or already deleted', product_id;
            END IF;
        END LOOP;

        RAISE NOTICE 'All products processed successfully!';

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error during deletion: %', SQLERRM;
    END;
END $$;
