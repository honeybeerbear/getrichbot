import db from "./db.js";

export default class accountdb extends db {
  constructor(filename) {
    super("account.json");
  }

  // market 데이터 추가
  async insert(chat_id, key, value) {
    await this.db.read();

    this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        e[key] = value;
      }
    });
    await this.db.write();
  }

  async setMaxMarket(chat_id, value) {
    await this.db.read();

    this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        e.max_markets = value;
      }
    });

    await this.db.write();
  }

  async setMaxamount(chat_id, value) {
    await this.db.read();

    this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        e.max_amount = value;
      }
    });

    await this.db.write();
  }

  async addMarket(chat_id, value) {
    await this.db.read();

    this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        const list = e.markets;
        list.push(value);
      }
    });

    await this.db.write();
  }

  async removeMarket(chat_id, value) {
    await this.db.read();

    this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        let list = e.markets;
        const idx = list.findIndex((e) => {
          return e == value;
        });

        if (idx > -1) list.splice(idx, 1);
        console.log(list);
      }
    });

    await this.db.write();
  }

  async getMarketCount(chat_id) {
    await this.db.read();

    let cnt = 0;
    this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        cnt = e.markets.length;
      }
    });
    return cnt;
  }
}
