const bcrypt = require(`bcrypt`);


const hashed_pass = await bcrypt.hash("Pass123", 10);

console.log(`hashed password : ${hashed_pass}`);