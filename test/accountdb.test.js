import accountdb from "../db/accountdb.js";
(async () => {
  const accountDB = new accountdb();
  await accountDB.initialize();

  const marketList = ["KRW-BTC", "KRW-ETH"];
  await accountDB.insert("627657893", "markets", marketList);
})();
