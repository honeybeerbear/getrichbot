import { join, dirname } from "path";
import { Low, JSONFileSync } from "lowdb";
import { fileURLToPath } from "url";

export default class db {
  constructor(filename) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    this.db = new Low(new JSONFileSync(join(__dirname, "/data/" + filename)));
    this.filename = filename;
  }

  async initialize() {
    await this.db.read();
    this.db.data = this.db.data || { name: this.filename, v: [] };
    await this.db.write();
  }

  async write(data) {
    await this.db.read();
    this.db.data.v.push(data);
    await this.db.write();
  }

  async read(comparer) {
    await this.db.read();
    return comparer ? this.db.data.v.find(comparer) : this.db.data.v;
  }

  async readAll() {
    await this.db.read();
    return this.db.data.v;
  }
}
