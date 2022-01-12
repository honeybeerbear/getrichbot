const _sleep = (d) => new Promise((res) => setTimeout(res, d));
let job = [];
const cronbot = async () => {
  const jobinfo = job.shift();
  if (jobinfo) jobinfo();
  await _sleep(200);
  return cronbot();
};

cronbot();

const orderbot = {
  addJob: (arr) => {
    job.push(arr);
  },
};

export default orderbot;
