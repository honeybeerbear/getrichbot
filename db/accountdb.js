import db from "./db.js";

export default class accountdb extends db {
  constructor() {
    super("account.json");
  }

  async getAccount(chat_id) {
    await this.db.read();
    return this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) return e;
    });
  }

  async insertAccount(chat_id, user_name) {
    const isExist = await this.getAccount(chat_id);

    if (!isExist) {
      const value = {
        chat_id: chat_id,
        user_name: user_name,
        access_key: "",
        secret_key: "",
        max_amount: 10000,
        max_markets: 20,
        markets: [],
      };

      this.db.data.v.push(value);
      await this.db.write();
    }
  }

  // market 데이터 추가
  async insertAllMarket(chat_id, key, value) {
    await this.db.read();

    const isupdate = this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        e[key] = value;
        return true;
      }
    });
    if (isupdate) await this.db.write();
  }

  async setSecretKey(chat_id, value) {
    await this.db.read();

    const isupdate = this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        e.secret_key = value;
        return true;
      }
    });

    if (isupdate) await this.db.write();
  }

  async setAccessKey(chat_id, value) {
    await this.db.read();

    const isupdate = this.db.data.v.find((e) => {
      if (e.chat_id == chat_id) {
        e.access_key = value;
        return true;
      }
    });

    if (isupdate) await this.db.write();
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

  async setMaxAmount(chat_id, value) {
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
