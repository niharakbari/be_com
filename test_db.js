require('dotenv').config({ path: 'backend/.env' });
const transactionModel = require('./backend/src/models/transactionModel');

async function test() {
  try {
    const res = await transactionModel.getTransactions(1);
    console.log("SUCCESS:");
    console.log(res);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
  process.exit();
}
test();
