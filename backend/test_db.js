require('dotenv').config();
const transactionModel = require('./src/models/transactionModel');

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
