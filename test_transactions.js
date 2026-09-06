require('dotenv').config({ path: 'backend/.env' });
const transactionService = require('./backend/src/services/transactionService');

const USER_ID = 1;

async function runTests() {
  const tests = [
    { name: "2. Test pagination", query: { page: "1", limit: "2" } },
    { name: "3. Test startDate/endDate", query: { startDate: "2026-09-01", endDate: "2026-09-05" } },
    { name: "4. Test combined filters + pagination", query: { startDate: "2026-09-01", endDate: "2026-09-05", page: "1", limit: "1" } },
    { name: "5. Test invalid dates (startDate)", query: { startDate: "invalid-date" }, expectError: true },
    { name: "5. Test invalid dates (endDate)", query: { endDate: "2026-13-45" }, expectError: true },
    { name: "6. Test startDate > endDate", query: { startDate: "2026-09-05", endDate: "2026-09-01" }, expectError: true },
    { name: "7. Test invalid page/limit", query: { page: "-1", limit: "abc" } }, // should fallback to defaults
    { name: "8. Test page beyond available records", query: { page: "999", limit: "10" } },
    { name: "9. Verify existing type/category/paymentMode/sorting still work", query: { type: "expense", sortBy: "amount", order: "ASC", limit: "2" } }
  ];

  for (const t of tests) {
    console.log(`\n--- ${t.name} ---`);
    try {
      const res = await transactionService.getTransactions(USER_ID, t.query);
      if (t.expectError) {
        console.error("❌ FAILED: Expected an error but got success.");
      } else {
        console.log("✅ SUCCESS:");
        console.log(`Transactions returned: ${res.transactions?.length}`);
        console.log("Pagination state:", res.pagination);
      }
    } catch (err) {
      if (t.expectError) {
        console.log(`✅ SUCCESS (Caught expected error): ${err.message}`);
      } else {
        console.error("❌ FAILED with unexpected error:");
        console.error(err);
      }
    }
  }
  process.exit();
}

runTests();
