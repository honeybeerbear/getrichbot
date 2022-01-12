import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import querystring from "querystring";
import crypto from "crypto";

const query = querystring.encode({ market: "KRW-BTC" });

const hash = crypto.createHash("sha512");
const queryHash = hash.update(query, "utf-8").digest("hex");

const payload = {
  access_key: "StOXGRgvmiKN6IHSkteodr1qdRfy770DInSdwdb6",
  nonce: uuidv4(),
  query_hash: queryHash,
  query_hash_alg: "SHA512",
};

const jwtToken = jwt.sign(payload, "OXkdJyGBpx5slIiTr4lc5VndV37Z8vtwuaRJZjHF");
const authorizationToken = `Bearer ${jwtToken}`;

// const getAccounts = (accessKey, secretKey) => {
//   try {
//     const body = {};
//     const query = queryEncode.encode(body);

//     const hash = crypto.createHash("sha512");
//     const queryHash = hash.update(query, "utf-8").digest("hex");
//     console.log(v4());
//     const payload = {
//       access_key: accessKey,
//       nonce: v4(),
//       // query_hash: queryHash,
//       // query_hash_alg: "SHA512",
//     };
//     const token = sign(payload, secretKey);

//     //   const header = {
//     //     method: "GET",
//     //     url: "https://api.upbit.com" + "/v1/accounts",
//     //     headers: { Authorization: `Bearer ${token}` },
//     //     json: {},
//     //   };
//     //   return getRequestAxios(upbitServerUrl + upbitAccounts, header);

//     const options = {
//       method: "GET",
//       url: upbitServerUrl + upbitAccounts,
//       headers: { Authorization: `Bearer ${token}` },
//       json: {},
//     };
//     return getRequest(options);
//   } catch (e) {
//     console.log(e);
//   }
// };
