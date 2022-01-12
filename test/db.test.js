import db from "../db/db.js";

(async () => {
  // const accountdb = db("account.json");
  // const rtn = await accountdb.read();
  // console.log(rtn);

  const test = new db("test.json");
  const rtn = await test.readAll();
  console.log(rtn);
})();
