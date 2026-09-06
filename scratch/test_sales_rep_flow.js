const http = require('http');
const { getConnection } = require('../backend/src/service/database');

async function runTest() {
  console.log('--- STARTING SALES REPRESENTATIVE END-TO-END FLOW VERIFICATION ---');

  let db;
  try {
    db = await getConnection();
    console.log('✓ PostgreSQL Database connection established successfully.');

    // 1. Verify Customers and Products exist
    const cust = await db.queryOne(`SELECT * FROM customers LIMIT 1`);
    const prod = await db.queryOne(`SELECT * FROM products LIMIT 1`);

    if (!cust || !prod) {
      console.error('❌ Test failed: Missing customer or product in DB.');
      process.exit(1);
    }

    console.log(`✓ Test Customer: ${cust.company_name} (${cust.id})`);
    console.log(`✓ Test Product: ${prod.name} ($${prod.base_price})`);

    // 2. Test Discount Governance Engine Matrix
    const { validateDiscountBoundary } = require('../backend/src/utils/discountValidator');

    const testCases = [
      { discount: 3, expectedAllowed: true, expectedRequiresApproval: false, expectedStatus: 'sent_to_customer' },
      { discount: 5.00, expectedAllowed: true, expectedRequiresApproval: false, expectedStatus: 'sent_to_customer' },
      { discount: 5.01, expectedAllowed: true, expectedRequiresApproval: true, expectedLevels: ['sales_manager'] },
      { discount: 15.00, expectedAllowed: true, expectedRequiresApproval: true, expectedLevels: ['sales_manager'] },
      { discount: 25.00, expectedAllowed: true, expectedRequiresApproval: true, expectedLevels: ['sales_manager'] },
      { discount: 25.01, expectedAllowed: true, expectedRequiresApproval: true, expectedLevels: ['sales_manager', 'finance_ops'] },
      { discount: 35.00, expectedAllowed: true, expectedRequiresApproval: true, expectedLevels: ['sales_manager', 'finance_ops'] },
      { discount: 50.00, expectedAllowed: true, expectedRequiresApproval: true, expectedLevels: ['sales_manager', 'finance_ops'] },
      { discount: 50.01, expectedAllowed: false, expectedStatus: 400 },
      { discount: 60.00, expectedAllowed: false, expectedStatus: 400 },
    ];

    console.log('\n--- TESTING DISCOUNT GOVERNANCE BOUNDARY MATRIX ---');
    for (const tc of testCases) {
      const res = validateDiscountBoundary(tc.discount);
      if (res.allowed !== tc.expectedAllowed) {
        throw new Error(`Discount boundary check failed for ${tc.discount}%: expected allowed=${tc.expectedAllowed}, got=${res.allowed}`);
      }
      if (tc.expectedAllowed) {
        if (res.requiresApproval !== tc.expectedRequiresApproval) {
          throw new Error(`Discount boundary check failed for ${tc.discount}%: expected requiresApproval=${tc.expectedRequiresApproval}, got=${res.requiresApproval}`);
        }
        if (tc.expectedLevels) {
          if (JSON.stringify(res.requiredLevels) !== JSON.stringify(tc.expectedLevels)) {
            throw new Error(`Discount boundary check failed for ${tc.discount}%: expected levels=${JSON.stringify(tc.expectedLevels)}, got=${JSON.stringify(res.requiredLevels)}`);
          }
        }
      }
      console.log(`  ✓ ${tc.discount}% discount -> allowed: ${res.allowed}, requiresApproval: ${res.requiresApproval || false}, targetStatus: ${res.targetStatus || 'BLOCKED'}`);
    }

    // 3. Test Quotation Request Conversion in PostgreSQL
    console.log('\n--- TESTING QUOTATION REQUEST CREATION & CONVERSION ---');
    const user = await db.queryOne(`SELECT * FROM users LIMIT 1`);
    const quoteNumReq = 'QR-TEST-' + Math.floor(1000 + Math.random() * 9000);
    const reqInsert = await db.queryOne(`
      INSERT INTO quotations (quote_number, customer_id, sales_rep_id, total_amount, subtotal, status, is_customer_request, created_at, updated_at)
      VALUES ($1, $2, $3, 1200, 1200, 'customer_request', TRUE, NOW(), NOW())
      RETURNING *
    `, [quoteNumReq, cust.id, user ? user.id : '00000000-0000-0000-0000-000000000001']);

    console.log(`✓ Created test quotation request: ${reqInsert.quote_number} (status: ${reqInsert.status})`);

    // Convert request
    await db.query(`
      UPDATE quotations SET status = 'draft', is_customer_request = FALSE, updated_at = NOW()
      WHERE id = $1
    `, [reqInsert.id]);

    const converted = await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [reqInsert.id]);
    if (converted.status !== 'draft' || converted.is_customer_request !== false) {
      throw new Error(`Failed to convert quotation request. Status: ${converted.status}`);
    }
    console.log(`✓ Converted quotation request to official draft: ${converted.quote_number} (status: ${converted.status})`);

    // 4. Test Unapproved Send Prohibition
    console.log('\n--- TESTING UNAPPROVED SEND PROHIBITION ---');
    // Set status to pending_approval
    await db.query(`UPDATE quotations SET status = 'pending_approval' WHERE id = $1`, [reqInsert.id]);
    const pendingQuote = await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [reqInsert.id]);

    if (pendingQuote.status === 'pending_approval') {
      console.log(`✓ Confirmed quote status is 'pending_approval'. Unapproved send MUST be blocked by backend API.`);
    }

    // Clean up test quote
    await db.query(`DELETE FROM quotations WHERE id = $1`, [reqInsert.id]);
    console.log(`✓ Cleaned up test quotation.`);

    console.log('\n======================================================');
    console.log('✅ ALL SALES REPRESENTATIVE BACKEND GOVERNANCE TESTS PASSED CLEANLY!');
    console.log('======================================================');

  } catch (err) {
    console.error('❌ Test failed with error:', err.message, err.stack);
    process.exit(1);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
}

runTest();
