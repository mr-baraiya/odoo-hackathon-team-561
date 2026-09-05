const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: '7096413386',
  port: 5432,
});

// Configuration
const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/rd_vk_1.csv'; // Update this path to your CSV file

async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`CSV file not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Map CSV columns to our expected format
        results.push({
          id: data.id,
          brand: data.brand,
          bill_percentage: data.bill_percentage,
          transport_name: data.transport_name,
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function validatePartyIds(client, parties) {
  const partyIds = parties.map((p) => p.id).filter((id) => id && id.trim() !== '');

  if (partyIds.length === 0) {
    console.log('No valid party IDs found in CSV');
    return [];
  }

  console.log('Validating party IDs:', partyIds);

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validUuids = partyIds.filter((id) => uuidRegex.test(id));

  if (validUuids.length === 0) {
    console.log('No valid UUIDs found in CSV');
    return [];
  }

  const placeholders = validUuids.map((_, index) => `$${index + 1}`).join(',');

  const result = await client.query(`
    SELECT id, name FROM parties WHERE id IN (${placeholders})
  `, validUuids);

  const existingParties = result.rows;
  const existingIds = new Set(existingParties.map((row) => row.id));

  console.log(`Found ${existingParties.length} existing parties out of ${validUuids.length} valid UUIDs`);

  // Return only parties that exist in database
  const validParties = parties.filter((party) => existingIds.has(party.id));

  // Log parties that don't exist
  const nonExistingIds = validUuids.filter((id) => !existingIds.has(id));
  if (nonExistingIds.length > 0) {
    console.log('Parties not found in database:', nonExistingIds);
  }

  return validParties;
}

async function updateParty(client, party) {
  try {
    console.log(`Updating party: ${party.id}`);

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (party.brand !== undefined && party.brand !== null && party.brand !== '') {
      updateFields.push(`brand = $${paramIndex}`);
      values.push(party.brand);
      paramIndex += 1;
    }

    if (party.bill_percentage !== undefined && party.bill_percentage !== null && party.bill_percentage !== '') {
      updateFields.push(`bill_percentage = $${paramIndex}`);
      values.push(parseFloat(party.bill_percentage));
      paramIndex += 1;
    }

    if (party.transport_name !== undefined && party.transport_name !== null && party.transport_name !== '') {
      updateFields.push(`transport_name = $${paramIndex}`);
      values.push(party.transport_name);
      paramIndex += 1;
    }

    // Add updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 0) {
      console.log('No fields to update for party');
      return { success: true, party: party.id, message: 'No fields to update' };
    }

    values.push(party.id);

    const query = `
      UPDATE parties
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name
    `;

    const result = await client.query(query, values);

    if (result.rowCount > 0) {
      console.log(`Successfully updated party: ${result.rows[0].name} (${result.rows[0].id})`);
      return { success: true, party: result.rows[0].name, id: result.rows[0].id };
    }
    console.log(`Party ${party.id} not found during update`);
    return { success: false, party: party.id, error: 'Party not found during update' };

  } catch (error) {
    console.error(`Error updating party ${party.id}:`, error.message);
    return { success: false, party: party.id, error: error.message };
  }
}

async function updatePartiesFromCsv() {
  const client = await pool.connect();

  try {
    console.log('Starting party update process from CSV...');

    // Read and parse CSV file
    const parties = await parseCsvFile(CSV_FILE_PATH);
    console.log('parties', parties);
    console.log(`Found ${parties.length} parties in CSV`);

    // Validate that parties exist in database
    const validParties = await validatePartyIds(client, parties);
    console.log(`${validParties.length} parties exist in database and will be updated`);

    if (validParties.length === 0) {
      console.log('No valid parties found to update. Exiting...');
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    try {
      // Process each party individually within transaction
      const results = await Promise.allSettled(validParties.map(async (party) => updateParty(client, party)));

      // If all updates successful, commit transaction
      await client.query('COMMIT');

      // Count successes
      const successCount = results.filter((result) => result.status === 'fulfilled' && result.value.success).length;
      const errorCount = results.filter((result) => result.status === 'rejected').length;

      console.log('\n🎉 Party update process completed!');
      console.log(`✅ Successfully updated: ${successCount} parties`);
      console.log(`❌ Failed to update: ${errorCount} parties`);

      if (successCount > 0) {
        console.log('\nSuccessfully updated parties:');
        results.filter((r) => r.status === 'fulfilled' && r.value.success).forEach((r) => {
          console.log(`- ${r.value.party} (${r.value.id})`);
        });
      }

    } catch (error) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      console.error('❌ Transaction rolled back due to error:', error.message);

      // Log error to file
      fs.appendFileSync('error.txt', `${new Date().toISOString()} | Party Update Error: ${error.message}\n`);

      throw error;
    }

  } catch (error) {
    console.error('❌ Critical error during party update process:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await updatePartiesFromCsv();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updatePartiesFromCsv };
