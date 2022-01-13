process.env.NTBA_FIX_319 = 1;

import TelegramBot from "node-telegram-bot-api";
import upbitapi from "./lib/upbitapi.js";
import accountdb from "./db/accountdb.js";
import orderbot from "./orderbot.js";
import dotenv from "dotenv";
import path from "path";
const __dirname = path.resolve();

if (process.env.NODE_ENV == "production") {
  dotenv.config({ path: path.join(__dirname, ".env") });
} else if (process.env.NODE_ENV == "development") {
  dotenv.config({ path: path.join(__dirname, ".env.development.local") });
}

// @hbbupbitbot
const token = process.env.TELEGRAM_TOKEN;
console.log(`run telegram bot Token ID is : ${token}`);
const welcomestr = `
getrichbot 명령어 List

# 도움말 표시         /help or /h
# 코인 시세 조회      /price [코인명]       or   /p [코인명]

## 마켓 설정
  매수 대상 코인 추가   /m load       or /market load
  매수 코인 삭제        /m d [코인명]  or /market d btc
  매수 코인 추가        /m a [코인명]
  매수 코인 리스트      /m show

## 계정 설정  /a, /account
  access key           /a accesskey [your acccess key]
  secret key           /a secretkey [your secret key]
  최대 매수 금액        /a amount [금액]
  매수 코인 개수        /a market [개수]  

## 매수
  전체 매수            /b all         or    /buy all
  개별 매수            /b [코인명]     or    /buy [코인명]

## 매도
  전체 매도            /s all         or    /sell all
  개별 매도            /s [코인명] 

## 자산 리스트
  자산 리스트 조회      /list         or   /li
`;

const bot = new TelegramBot(token, { polling: true });
const accountDB = new accountdb();
accountDB.initialize();

const getAccount = (chatid) => {
  return (ele) => {
    return ele.chat_id == chatid ? 1 : 0;
  };
};

const getMarketData = async () => {
  // 마켓 내 거래되는 코인 정보 불러오기
  const getMarkets = await upbitapi.getMarkets(true);
  const marketList = JSON.parse(getMarkets);

  // 마켓 캡 순위로 sorting
  let symbolList = [];
  marketList.map((ele) => {
    const market = ele.market.split("-");
    market[0] == "KRW" ? symbolList.push(market[1]) : {};
  });
  const priceall = await upbitapi.getPrices(symbolList);
  const pricelist = JSON.parse(priceall);

  pricelist.sort((a, b) => {
    return b.acc_trade_price_24h - a.acc_trade_price_24h;
  });

  return pricelist;
};

bot.onText(/\/자산|\/list|\/li/, async (msg, match) => {
  /**
   {
    currency: 'MATIC',
    balance: '50.98658691',
    locked: '0.0',
    avg_buy_price: '3092.0681',
    avg_buy_price_modified: false,
    unit_currency: 'KRW'
  }
   */
  try {
    const accountdata = await accountDB.read(getAccount(msg.chat.id));
    const accounts = await upbitapi.getAccounts(
      accountdata.access_key,
      accountdata.secret_key
    );

    let message = "";
    if (accounts) {
      let total = 0;

      accounts.forEach((element) => {
        const krw_bal =
          element.avg_buy_price == 0
            ? element.balance
            : element.balance * element.avg_buy_price;
        if (krw_bal > 0) {
          message =
            message +
            `${element.currency} : ${parseFloat(krw_bal)
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 원 (${parseFloat(
              element.balance
            )
              .toFixed(3)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${element.currency})\r\n`;
        }
      });
    }

    bot.sendMessage(msg.chat.id, message);
  } catch (e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, e);
  }
});

bot.onText(/\/(매도|sell|s)(.*)/, async (msg, match) => {
  let resp = match[2].trim(); // the captured "whatever"

  if (resp) {
    const accountdata = await accountDB.read(getAccount(msg.chat.id));

    if (resp.toUpperCase() == "ALL") {
      // symbol list에 등록된 전체 코인 매도

      const accountdata = await accountDB.read(getAccount(msg.chat.id));
      const accounts = await upbitapi.getAccounts(
        accountdata.access_key,
        accountdata.secret_key
      );

      accounts.forEach((element) => {
        const market = element.currency.startsWith("KRW-")
          ? element.currency
          : "KRW-" + element.currency;
        const balance = element.balance;
        if (accountdata.markets.indexOf(market) > -1) {
          orderbot.addJob(() => {
            upbitapi.orders(
              market,
              accountdata.access_key,
              accountdata.secret_key,
              "ask",
              balance
            );
          });
        }
      });

      bot.sendMessage(
        msg.chat.id,
        `등록된 전체 코인에 대해 ${prices} 금액 만큼 매도 주문 합니다.`
      );
    } else {
      // 개별 코인 매도
      const symbol = resp.toUpperCase();

      const accountdata = await accountDB.read(getAccount(msg.chat.id));
      const accounts = await upbitapi.getAccounts(
        accountdata.access_key,
        accountdata.secret_key
      );

      accounts.forEach((element) => {
        if (element.currency == symbol) {
          const balance = element.balance;

          upbitapi.orders(
            symbol.startsWith("KRW-") ? symbol : "KRW-" + symbol,
            accountdata.access_key,
            accountdata.secret_key,
            "ask",
            balance
          );
        }
      });

      bot.sendMessage(msg.chat.id, symbol + " 매도 주문 완료");
    }
  } else {
    bot.sendMessage(msg.chat.id, "명령어를 다시 확인하세요. /help");
  }
});

bot.onText(/\/(매수|buy|b)(.*)/, async (msg, match) => {
  let resp = match[2]; // the captured "whatever"

  if (resp) {
    resp = resp.trim();
    const accountdata = await accountDB.read(getAccount(msg.chat.id));

    if (resp.toUpperCase() == "ALL") {
      // symbol list에 등록된 전체 코인 매수
      const marketCount = await accountDB.getMarketCount(msg.chat.id);

      bot.sendMessage(
        msg.chat.id,
        `등록된 전체 코인에 대해 ${accountdata.max_amount} 금액 만큼 매수 주문 합니다.`
      );

      accountdata.markets.map((e) => {
        orderbot.addJob(() => {
          upbitapi.orders(
            e,
            accountdata.access_key,
            accountdata.secret_key,
            "bid",
            accountdata.max_amount
          );
        });
      });
    } else {
      // 개별 코인 매수
      const symbol = resp.toUpperCase();
      upbitapi.orders(
        symbol.startsWith("KRW-") ? symbol : "KRW-" + symbol,
        accountdata.access_key,
        accountdata.secret_key,
        "bid"
      );

      bot.sendMessage(msg.chat.id, symbol + " 매수 완료");
    }
  } else {
    bot.sendMessage(msg.chat.id, "코인명을 입력하세요");
  }
});

bot.onText(/\/help/, (msg, match) => {
  bot.sendMessage(msg.chat.id, welcomestr);
});

bot.onText(/\/(a|account) (.*)/, async (msg, match) => {
  let message = "";
  const resp = match[2].trim();

  if (!resp) {
    message = "명령어를 확인하세요.";
  } else {
    const params = resp.split(" ");
    if (params[0] == "amount") {
      // 최대 투자 금액 . 개별 코인에 대한 매수 금액
      if (isNaN(params[1])) {
        message = "숫자를 입력하세요.";
      } else {
        accountDB.setMaxAmount(msg.chat.id, params[1]);
        message = `최대 매수 금액 ${params[1]} 을 등록하였습니다.`;
      }
    } else if (params[0] == "market") {
      // 최초 불러오는 코인 개수
      if (isNaN(params[1])) {
        message = "숫자를 입력하세요.";
      } else {
        accountDB.setMaxMarket(msg.chat.id, params[1]);
        message = `${params[1]} 개수 만큼 코인 정보를 불러옵니다.`;
      }
    } else if (params[0] == "secretkey") {
      // secret key 등록
      accountDB.setSecretKey(msg.chat.id, params[1]);
      message = "secret key 등록 완료";
    } else if (params[0] == "accesskey") {
      // access key 등록
      accountDB.setAccessKey(msg.chat.id, params[1]);
      message = "access key 등록 완료";
    }
  }
  bot.sendMessage(msg.chat.id, message ? message : "명령어를 확인하세요.");
});

bot.onText(/\/(market|m) (.*)/, async (msg, match) => {
  const resp = match[2].trim();
  let message = "";

  if (!resp) {
    message = `
    매수할 코인 불러오기   /market load or /m load
    매수 코인 삭제        /market d BTC or /m d btc
    매수 코인 추가        /m a BTC
    매수 코인 리스트      /m show
    `;
  } else if (resp == "load") {
    const accountdata = await accountDB.read(getAccount(msg.chat.id));
    const allMarketList = await getMarketData();

    const markets = allMarketList.slice(0, accountdata.max_markets).map((e) => {
      return e.market;
    });

    accountDB.insertAllMarket(msg.chat.id, "markets", markets);
    message = `다음의 코인을 매수 리스트에 등록 합니다.
      ${markets}`;
  } else if (resp == "show") {
    const accountdata = await accountDB.read(getAccount(msg.chat.id));
    message =
      "매수 등록된 코인 리스트\r\n" +
      accountdata.markets.map((e) => {
        return e.replace(/KRW-/, "");
      });
  } else {
    const params = resp.split(" ");
    if (params[0] == "a") {
      const market = params[1].startsWith("KRW-")
        ? params[1]
        : "KRW-" + params[1];
      accountDB.addMarket(msg.chat.id, market.toUpperCase());
      message = `${market} 등록 완료`;
    } else if (params[0] == "d") {
      const market = params[1].startsWith("KRW-")
        ? params[1]
        : "KRW-" + params[1];

      // console.log(market.toUpperCase());
      accountDB.removeMarket(msg.chat.id, market.toUpperCase());
      message = `${market} 삭제 완료`;
    }
  }

  bot.sendMessage(msg.chat.id, message ? message : "명령어를 확인하세요.");
});

bot.onText(/\/(p|price) (.*)/, async (msg, match) => {
  let message = "";
  const resp = match[2].trim();

  if (resp) {
    const symbol = resp.toUpperCase();
    const priceList = await upbitapi.getPrices([symbol]);
    const price = JSON.parse(priceList)[0];

    const trade_price = price.trade_price;
    const opening_price = price.opening_price;

    const rate = ((trade_price - opening_price) / opening_price) * 100;

    message = `현제 시세 : ${trade_price
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 원 (${rate.toFixed(2)}%)`;
  }

  bot.sendMessage(
    msg.chat.id,
    message ? message : "코인명을 입력하세요. (ex. /p BTC)"
  );
});

bot.onText(/\/start/, async (msg, match) => {
  await accountDB.insertAccount(msg.chat.id, msg.chat.username);
  const message = `
  최초 사용자를 위한 사용 방법 안내
  1) 업비트 access key 등록 : /a accesskey [upbit access key]
  2) 업비트 secret key 등록 : /a secretkey [upbit secret key]
  3) 매수 금액 설정         : /a amount [매수 금액]
  4) 매수할 코인 개수 설정   : /a market [개수]
  5) 매수 대상 코인 불러오기 : /m load

  도움말 보기 /help
  `;
  bot.sendMessage(msg.chat.id, message);
});

bot.on("new_chat_members", async (msg) => {
  //   chat: {
  //     id: 627657893,
  //     first_name: 'j',
  //     last_name: 'hoo',
  //     username: 'hoo_j_s',
  //     type: 'private'
  //   },
  await accountDB.insertAccount(msg.chat.id, msg.chat.username);
  const message = `
  최초 사용자를 위한 사용 방법 안내
  1) 업비트 access key 등록 : /a accesskey [upbit access key]
  2) 업비트 secret key 등록 : /a secretkey [upbit secret key]
  3) 매수 금액 설정         : /a amount [매수 금액]
  4) 매수할 코인 개수 설정   : /a market [개수]
  5) 매수 대상 코인 불러오기 : /m load

  도움말 보기 /help
  `;
  bot.sendMessage(msg.chat.id, message);
});

// 신규 유저
// new_chat_members -> /help 메시지 출력
// /adduser upbit secret key 입력
// /config 설정 값 불러오기
