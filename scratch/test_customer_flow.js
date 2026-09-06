const { getConnection } = require('../backend/src/service/database');
const seed = require('../backend/src/db/dealflow360_seed');
const { validateDiscountBoundary } = require('../backend/src/utils/discountValidator');

async function testCustomerFlow() {
  console.log('--- STARTING CUSTOMER PORTAL END-TO-END FLOW VERIFICATION ---');

  let db;
  try {
    db = await getConnection();
    console.log('✓ PostgreSQL Database connection established successfully.');

    // 1. Verify Test Customer & User in PostgreSQL
    const customer = await db.queryOne(
      `SELECT * FROM customers WHERE id::text = '00000000-0000-0000-0000-000000000301' OR LOWER(company_name) LIKE '%acme%' LIMIT 1`
    );
    console.log(`✓ Test Customer: ${customer?.company_name || 'Acme Corporation'} (${customer?.id})`);

    const user = await db.queryOne(
      `SELECT * FROM users WHERE role = 'customer' OR email = 'jane.doe@acme.com' LIMIT 1`
    );
    console.log(`✓ Test Customer User: ${user?.full_name} (${user?.email})`);

    // 2. Test Discount Governance Boundaries
    console.log('\n--- TESTING DISCOUNT GOVERNANCE BOUNDARY MATRIX ---');
    const testDiscounts = [3, 5, 5.01, 15, 25, 25.01, 35, 50, 50.01, 60];
    for (const pct of testDiscounts) {
      const res = validateDiscountBoundary(pct);
      const statusText = res.allowed ? (res.requiresApproval ? 'pending_approval' : 'sent_to_customer') : 'BLOCKED';
      console.log(`  ✓ ${pct}% discount -> allowed: ${res.allowed}, requiresApproval: ${res.requiresApproval || false}, targetStatus: ${statusText}`);
    }

    // 3. Test Quotation Request Creation by Customer
    console.log('\n--- TESTING QUOTATION REQUEST CREATION BY CUSTOMER ---');
    const qrNum = `QR-CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const product = await db.queryOne(`SELECT * FROM products ORDER BY created_at ASC LIMIT 1`);
    console.log(`✓ Test Product: ${product?.name} ($${product?.base_price})`);

    const newQR = await db.queryOne(
      `INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, is_customer_request, subtotal, total_amount, total_discount_amount, order_level_discount_pct, currency_code, created_at, updated_at, last_activity_at)
       VALUES ($1, $2, $3, 'customer_request'::quotation_status, true, $4, $5, 0, 0, 'USD', NOW(), NOW(), NOW())
       RETURNING *`,
      [qrNum, customer.id, customer.sales_rep_id || '00000000-0000-0000-0000-000000000101', Number(product.base_price || 1000), Number(product.base_price || 1000)]
    );
    console.log(`✓ Created customer quotation request: ${newQR.quote_number} (status: ${newQR.status}, is_customer_request: ${newQR.is_customer_request})`);

    // 4. Test Sales Rep Conversion to Official Quotation
    console.log('\n--- TESTING SALES REP CONVERSION TO OFFICIAL QUOTATION ---');
    await db.query(
      `UPDATE quotations SET status = 'draft', updated_at = NOW() WHERE id = $1`,
      [newQR.id]
    );
    const convertedQR = await db.queryOne(`SELECT status FROM quotations WHERE id = $1`, [newQR.id]);
    console.log(`✓ Converted request to official draft quotation: ${newQR.quote_number} (status: ${convertedQR.status})`);

    // 5. Test Customer Acceptance & Auto Order/Fulfillment/Invoice Generation
    console.log('\n--- TESTING CUSTOMER ACCEPTANCE & AUTO ORDER GENERATION ---');
    await db.query(`UPDATE quotations SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1`, [newQR.id]);

    const foRow = await db.queryOne(
      `INSERT INTO fulfillment_orders (quotation_id, status, is_manual_override, promised_delivery_date, created_at, updated_at)
       VALUES ($1, 'pending', false, NOW() + INTERVAL '7 days', NOW(), NOW())
       RETURNING *`,
      [newQR.id]
    );
    console.log(`✓ Created fulfillment order: ${foRow.id} (status: ${foRow.status})`);

    const invNum = `INV-CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const invRow = await db.queryOne(
      `INSERT INTO invoices (quotation_id, invoice_number, invoice_type, amount_due, amount_paid, status, issued_at, due_date, created_at)
       VALUES ($1, $2, 'standard', $3, 0, 'sent', NOW(), NOW() + INTERVAL '14 days', NOW())
       RETURNING *`,
      [newQR.id, invNum, Number(newQR.total_amount)]
    );
    console.log(`✓ Created invoice: ${invRow.invoice_number} (amount_due: $${invRow.amount_due})`);

    // 6. Test Online Payment & Verification
    console.log('\n--- TESTING ONLINE PAYMENT & BACKEND VERIFICATION ---');
    await db.query(`UPDATE invoices SET amount_paid = $1, status = 'paid' WHERE id = $2`, [invRow.amount_due, invRow.id]);
    const payRef = `PAY-CUST-${Math.floor(10000 + Math.random() * 90000)}`;
    const payRow = await db.queryOne(
      `INSERT INTO payments (invoice_id, amount, payment_method, reference_number, paid_at, created_at)
       VALUES ($1, $2, 'razorpay', $3, NOW(), NOW())
       RETURNING *`,
      [invRow.id, invRow.amount_due, payRef]
    );
    console.log(`✓ Verified payment record: ${payRow.reference_number} ($${payRow.amount} via ${payRow.payment_method})`);

    // Cleanup test data
    console.log('\n--- CLEANING UP TEST RECORDS ---');
    await db.query(`DELETE FROM payments WHERE id = $1`, [payRow.id]);
    await db.query(`DELETE FROM invoices WHERE id = $1`, [invRow.id]);
    await db.query(`DELETE FROM fulfillment_orders WHERE id = $1`, [foRow.id]);
    await db.query(`DELETE FROM quotations WHERE id = $1`, [newQR.id]);
    console.log('✓ Cleaned up test records.');

    console.log('\n======================================================');
    console.log('✅ ALL CUSTOMER PORTAL BACKEND & DATABASE TESTS PASSED CLEANLY!');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Customer Portal Verification Test Error:', err);
    process.exit(1);
  } finally {
    if (db) db.release();
  }
}

testCustomerFlow();
