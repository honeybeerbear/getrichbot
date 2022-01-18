const _sleep = (d) => new Promise((res) => setTimeout(res, d));
let _job = [];
const cronbot = async () => {
  const job = _job.shift();
  if (job) job();
  await _sleep(200);
  return cronbot();
};

cronbot();

const orderbot = {
  addJob: (e) => {
    _job.push(e);
  },
};

export default orderbot;
