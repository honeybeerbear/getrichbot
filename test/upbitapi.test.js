import upbitapi from "../lib/upbitapi.js";
import marketDB from "../db/marketdb.js";
(async () => {
  // const price = await upbitapi.getPrices(["DOGE"]);
  // console.log(JSON.parse(price));
  // 데이터 가져오기
  // const getMarkets = await upbitapi.getMarkets(true);
  // const marketList = JSON.parse(getMarkets);
  // let symbolList = [];
  // marketList.map((ele) => {
  //   const market = ele.market.split("-");
  //   market[0] == "KRW" ? symbolList.push(market[1]) : {};
  // });
  // const priceall = await upbitapi.getPrices(symbolList);
  // console.log(JSON.parse(priceall));
})();

(async () => {
  const marketdb = new marketDB();
  const data = await marketdb.readAll();
  console.log(data);
})();
