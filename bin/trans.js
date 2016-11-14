#!/usr/bin/env node
const program       = require("commander");
const path          = require("path");
const version       = require(path.resolve(__dirname, '..', 'package.json')).version;
const color         = require("color-log");
const Table         = require("cli-table");
const querystring   = require("querystring");
const request       = require("request");
const crypto        = require("crypto");
const utf8          = require("utf8");
const param         = {from: 'auto', to: 'auto'};
const MD5           = require("blueimp-md5");
const config = {
  appid: process.env.END_TRANS_ID || 20151111000005104,
  key: process.env.END_TRANS_KEY || 'EqxJbJL3LKAW7P5UIltg',
  url: 'http://api.fanyi.baidu.com/api/trans/vip/translate?'
};

const errorMap = {
  '52001': 'TIMEOUT[请求超时]',
  '52002': 'SYSTEM ERROR[翻译系统错误]',
  '52003': 'UNAUTHORIZED USER[未授权用户]',
  '54000': 'EMPTY PRRAM[必填参数为空]',
  '58000': 'UNVALID IP[客户端 IP 非法]',
  '54001': 'ERROR SIGN[签名错误]',
  '54003': 'LIMIT TIMES[访问频率受限]',
};

let argv = process.argv;

const getUrl = (param) => {
  const appid = config.appid;
  const key = config.key;
  let salt = Date.now();
  let query = param.q;
  let from = param.from;
  let to = param.to;
  let str1 = appid + query + salt + key;
  let sign = MD5(str1);

  let qs = querystring.stringify({
    q: query,
    appid: appid,
    salt: salt,
    from: from,
    to: to,
    sign: sign
  });
  let url = config.url + qs;
  return url;
};

const lanMap = {
  'zh': '中文',
  'en': '英语',
  'yue': '粤语',
  'wyw': '文言文',
  'jp': '日语',
  'kor': '韩语',
  'fra': '法语',
  'spa': '西班牙语',
  'th': '泰语',
  'ara': '阿拉伯语',
  'ru': '俄语',
  'pt': '葡萄牙语',
  'de': '德语',
  'it': '意大利语',
  'el': '希腊语',
  'nl': '荷兰语',
  'pl': '波兰语',
  'bul': '保加利亚语',
  'est': '爱沙尼亚语',
  'dan': '丹麦语',
  'fin': '芬兰语',
  'cs': '捷克语',
  'rom': '罗马尼亚语',
  'slo': '斯洛文尼亚语',
  'swe': '瑞典语',
  'hu': '匈牙利语',
  'cht': '繁体中文',
  'auto': '自动检测'
};

const list = () => {
  let table = new Table({
    head: ['语言', '代码']
  });
  for (let i in lanMap) {
    table.push([lanMap[i], color.help(i)]);
  }
  console.log(table.toString());
};

const trans = () => {
  request(getUrl(param), (err, res, result) => {
    let body = JSON.parse(result);
    if (body['error_code']) {
      console.log(color.error(errorMap[body['error_code']]));
    } else {
      console.log(color.help(body['trans_result'][0].dst));
    }
  });
};

program
  .version(version)
  .option('-f, --from <value>', 'source language [default:zh]')
  .option('-t, --to <value>', 'destination language [default:en]')
  .option('-l, --list', 'list language map [e.g: en-English]', list)
  .option('-w, --word <value>', 'the word or sentence that will be translated')
  .parse(argv);

const len = argv.length;
if (len === 3 && (argv[2].indexOf('-') === -1)) {
  param.q = argv[2];
  trans();
} else {
  if (!program.list) {
    if (program.from) {
      param.from = program.from;
    }
    if (program.to) {
      param.to = program.to;
    }
    param.q = program.word;
    trans();
  }
}
