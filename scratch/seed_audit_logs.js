const { getConnection } = require('../backend/src/service/database');

async function seedAuditLogs() {
  try {
    const db = await getConnection();

    // Fetch users for performing actions
    const usersRes = await db.query(`SELECT id, full_name, role FROM users`);
    const users = usersRes.rows;
    const admin = users.find(u => u.role === 'admin') || users[0];
    const manager = users.find(u => u.role === 'sales_manager') || users[0];
    const rep = users.find(u => u.role === 'sales_rep') || users[0];
    const finance = users.find(u => u.role === 'finance_ops') || users[0];

    // Fetch quotations
    const quotesRes = await db.query(`SELECT id, quote_number, total_amount FROM quotations LIMIT 10`);
    const quotes = quotesRes.rows;

    // Fetch customers
    const custRes = await db.query(`SELECT id, company_name FROM customers LIMIT 5`);
    const customers = custRes.rows;

    console.log(`Found ${users.length} users, ${quotes.length} quotations, ${customers.length} customers.`);

    // Clear existing audit logs if any
    await db.query(`DELETE FROM audit_log`);

    const auditData = [
      {
        entity_type: 'quotation',
        entity_id: quotes[0]?.id || 'quote_1',
        action: 'QUOTATION_CREATED',
        reason: `Created new quotation ${quotes[0]?.quote_number || 'Q-2026-201'} with total value $${quotes[0]?.total_amount || 15000}`,
        performed_by_user_id: rep.id,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      },
      {
        entity_type: 'quotation',
        entity_id: quotes[0]?.id || 'quote_1',
        action: 'DISCOUNT_APPROVAL_REQUESTED',
        reason: 'Requested 18% order level discount approval for key account tier override',
        performed_by_user_id: rep.id,
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        entity_type: 'quotation',
        entity_id: quotes[0]?.id || 'quote_1',
        action: 'QUOTATION_APPROVED',
        reason: 'Approved 18% discount for enterprise client under Q3 sales campaign rules',
        performed_by_user_id: manager.id,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        entity_type: 'quotation',
        entity_id: quotes[1]?.id || 'quote_2',
        action: 'QUOTATION_REJECTED',
        reason: 'Rejected 35% discount request as it breaches minimum margin threshold of 15%',
        performed_by_user_id: manager.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        entity_type: 'customer',
        entity_id: customers[0]?.id || 'cust_1',
        action: 'CUSTOMER_TIER_UPDATED',
        reason: `Upgraded customer ${customers[0]?.company_name || 'Acme Corp'} from Silver to Platinum tier`,
        performed_by_user_id: admin.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        entity_type: 'user',
        entity_id: rep.id,
        action: 'USER_ROLE_CHANGED',
        reason: 'Updated user permissions to include senior sales representative quota authorization',
        performed_by_user_id: admin.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
      {
        entity_type: 'subscription',
        entity_id: quotes[2]?.id || 'quote_3',
        action: 'SUBSCRIPTION_PRORATED',
        reason: 'Prorated monthly billing schedule upon mid-cycle add-on of 5 Enterprise User seats',
        performed_by_user_id: finance.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        entity_type: 'deal_health',
        entity_id: quotes[3]?.id || 'quote_4',
        action: 'ALERT_ESCALATED',
        reason: `Escalated delivery slippage alert for quotation ${quotes[3]?.quote_number || 'Q-2026-204'} to logistics manager`,
        performed_by_user_id: manager.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        entity_type: 'deal_health',
        entity_id: quotes[4]?.id || 'quote_5',
        action: 'ALERT_ACKNOWLEDGED',
        reason: 'Acknowledged stalled deal notification and contacted primary buyer contact',
        performed_by_user_id: rep.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      },
      {
        entity_type: 'fulfillment',
        entity_id: quotes[5]?.id || 'quote_6',
        action: 'FULFILLMENT_SPLIT_CREATED',
        reason: 'Split fulfillment order across Warehouses WH-NORTH-01 and WH-WEST-02 due to stock allocation',
        performed_by_user_id: finance.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      },
      {
        entity_type: 'quotation',
        entity_id: quotes[6]?.id || 'quote_7',
        action: 'NEGOTIATION_SUBMITTED',
        reason: 'Customer requested 5% additional discount and Net-60 payment terms via customer portal',
        performed_by_user_id: rep.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
      },
      {
        entity_type: 'auth',
        entity_id: admin.id,
        action: 'USER_LOGIN_SUCCESS',
        reason: 'Admin user logged in successfully from authorized IP 192.168.1.1',
        performed_by_user_id: admin.id,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      }
    ];

    for (const item of auditData) {
      await db.query(`
        INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [item.entity_type, item.entity_id, item.action, item.reason, item.performed_by_user_id, item.created_at]);
    }

    console.log(`Successfully seeded ${auditData.length} audit log entries into DB!`);

    const countRes = await db.query(`SELECT COUNT(*) FROM audit_log`);
    console.log('Total audit_log entries in DB:', countRes.rows[0].count);

    db.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAuditLogs();
