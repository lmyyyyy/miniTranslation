import md5 from './md5.min.js'

const URL = 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate';
const APP_KEY = 'LpCW2DKkY2lh28SC';
const APP_ID = 2114106434;


//url-encode的js实现方法
var URLEncode = function (clearString) {
  var output = '';
  var x = 0;
  clearString = clearString.toString();
  var regex = /(^[a-zA-Z0-9-_.]*)/;
  while (x < clearString.length) {
    var match = regex.exec(clearString.substr(x));
    if (match != null && match.length > 1 && match[1] != '') {
      output += match[1];
      x += match[1].length;
    } else {
      if (clearString.substr(x, 1) == ' ') {
        //原文在此用 clearString[x] == ' ' 做判断, 但ie不支持把字符串当作数组来访问, 
        //修改后两种浏览器都可兼容 
        output += '+';
      }
      else {
        var charCode = clearString.charCodeAt(x);
        var hexVal = charCode.toString(16);
        output += '%' + (hexVal.length < 2 ? '0' : '') + hexVal.toUpperCase();
      }
      x++;
    }
  }
  return output;
}

var ksort = function (arys) {
  //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
  var newkey = Object.keys(arys).sort();
  //console.log('newkey='+newkey);
  var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
  for (var i = 0; i < newkey.length; i++) {
    //遍历newkey数组
    newObj[newkey[i]] = arys[newkey[i]];
    //向新创建的对象中按照排好的顺序依次增加键值对

  }
  return newObj; //返回排好序的新对象
}

//1.生成鉴权签名sign
var getReqSign = function (params, appkey) {

  // 1. 字典升序排序
  let params2 = ksort(params);

  var temp2 = JSON.stringify(params2);         //test
  console.log("params2:"+temp2)

  // 2. 拼按URL键值对
  let str = '';
  for (var key in params2) {
    if (params2.hasOwnProperty(key)) {
      let value = params2[key];
      if (value !== '') { // 过滤空值，比如sign
        str += key + '=' + URLEncode(value) + '&';
      }
      else{
        console.log("key:"+key)
      }
    }
  }

  // 3. 拼接app_key
  str += 'app_key=' + appkey;
  console.log("str:"+str);

  // 4. MD5运算+转换大写，得到请求签名
  let sign = md5(str || '').toUpperCase();

  return sign;
}




var translator = function (sentense, sour, tar) {
  //Promise 对象
  return new Promise((resolve, reject) => {

    let params = {
      app_id: APP_ID,
      nonce_str: Math.random().toString(36).slice(-5),
      sign: '',            // 初始值一定要写成'',不要写成别的值
      source: sour,
      target: tar,
      text: sentense,
      time_stamp: (Date.now() / 1000).toFixed(0)
    }

    params.sign = getReqSign(params, APP_KEY);

    console.log("params.sign:" + params.sign)         //test

    wx.request({
      url: URL,
      data: params,
      success(res) {
        var temp= JSON.stringify(res);
        console.log(temp)

        if (res.data && res.target_text) {
          resolve(res.data)
        } 
        else {
          reject({ status: 'error', msg: '翻译失败了' })
          wx.showToast({
            title: '翻译失败',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail() {
        reject({ status: 'error', msg: '翻译失败' })
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 3000
        })
      }
    })
  })
}

module.exports = translator;