/**
 * India financial year: 1 April through 31 March (inclusive of 31 Mar).
 * Compares transaction `date` (timestamptz) to the FY derived from a reference timestamp.
 *
 * @param {string} dateColumn — qualified or unqualified column, e.g. `date` or `t.date`
 * @param {string} refParam — placeholder, e.g. `$4` or `$serial_ref_date`
 * @returns {string}
 */
function indiaFyWindowSql(dateColumn, refParam) {
  const d = `${refParam}::timestamptz::date`;
  return `(${dateColumn} >= (
    CASE WHEN EXTRACT(MONTH FROM ${d}) >= 4
      THEN make_date(EXTRACT(YEAR FROM ${d})::int, 4, 1)
      ELSE make_date(EXTRACT(YEAR FROM ${d})::int - 1, 4, 1)
    END
  ) AND ${dateColumn} < (
    CASE WHEN EXTRACT(MONTH FROM ${d}) >= 4
      THEN make_date(EXTRACT(YEAR FROM ${d})::int + 1, 4, 1)
      ELSE make_date(EXTRACT(YEAR FROM ${d})::int, 4, 1)
    END
  ))`;
}

module.exports = { indiaFyWindowSql };
