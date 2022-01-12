import axios from "axios";
import pkg from "uuid";
const { v4: uuidv4 } = pkg;
import queryEncode from "querystring";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
import request from "request";

const upbitTicker = "/v1/ticker";
const upbitAccounts = "/v1/accounts";
const upbitOrders = "/v1/orders";
const upbitMarkets = "/v1/market";
const upbitServerUrl = "https://api.upbit.com";

const sign = jsonwebtoken.sign;

// const getRequestAxios = (urlString, header = null) => {
//   return new Promise((resolve, reject) => {
//     axios
//       .get(urlString, header)
//       .then(function (res) {
//         if (res) {
//           const data = res.data;
//           console.log(res);
//           resolve(data);
//         } else {
//           resolve(0);
//         }
//       })
//       .catch((err) => {
//         reject(err);
//         return;
//       });
//   });
// };

const getRequest = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) throw new Error(error);
      resolve(body);
    });
  });
};

const upbitapi = {
  getPrices: (arr) => {
    const options = {
      method: "GET",
      url: `${upbitServerUrl}${upbitTicker}?markets=${arr
        .map((ele) => "KRW-" + ele)
        .join(",")}`,
      headers: { Accept: "application/json" },
    };
    return getRequest(options);
  },
  getAccounts: (accessKey, secretKey) => {
    try {
      const payload = {
        access_key: accessKey,
        nonce: uuidv4(),
      };
      const token = sign(payload, secretKey);

      const options = {
        method: "GET",
        url: upbitServerUrl + upbitAccounts,
        headers: { Authorization: `Bearer ${token}` },
        json: {},
      };
      return getRequest(options);
    } catch (e) {
      console.log(e);
    }
  },
  getMarkets: (isDetails = false) => {
    try {
      const options = {
        method: "GET",
        url: `${upbitServerUrl}${upbitMarkets}/all?isDetails=${isDetails}`,
        headers: { Accept: "application/json" },
      };
      return getRequest(options);
    } catch (e) {
      console.log(e);
    }
  },
  orders: (market, accessKey, secretKey, side = "bid", amount) => {
    try {
      const body = {
        market: market,
        side: side, // buy :    bid, sell : ask
        //volume: "1.71969553",
        //price: 0,
        ord_type: side == "bid" ? "price" : "market",
      };

      if (side == "bid") {
        body.price = amount;
      } else if (side == "ask") {
        body.volume = amount;
      }

      console.log(body);
      const query = queryEncode.encode(body);
      const hash = crypto.createHash("sha512");
      const queryhash = hash.update(query, "utf-8").digest("hex");

      const payload = {
        access_key: accessKey,
        nonce: uuidv4(),
        query_hash: queryhash,
        query_hash_alg: "SHA512",
      };

      const token = sign(payload, secretKey);

      const options = {
        method: "POST",
        url: upbitServerUrl + upbitOrders,
        headers: { Authorization: `Bearer ${token}` },
        json: body,
      };
      return getRequest(options);
    } catch (e) {
      console.log(e);
    }
  },
};

export default upbitapi;
