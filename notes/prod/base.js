
/*
function onInit() {
  var wifi = require('Wifi');
  var http = require('http');
  wifi.disconnect()
  wifi.startAP('TGTG00110011', { password: '01234567899999', authMode: 'wpa2' }, function () {
    console.log('hello')
  var led = Pin(5);
  http.createServer(function (req, res) {
    var url = req.url;
    res.writeHead(200);
    res.end('turnips')
  }).listen(80);
  })
}

setInterval(function () {
  digitalWrite(LED1, 1);
}, Math.floor(Math.random()*1000))
setInterval(function () {
  digitalWrite(LED1, 0);
}, Math.floor(Math.random()*1000))
setInterval(function () {
  digitalWrite(LED2, 1);
}, Math.floor(Math.random()*1000))
setInterval(function () {
  digitalWrite(LED2, 0);
}, Math.floor(Math.random()*1000))
*/

Serial1.setup(115200, { tx:B6, rx:B7 });

var incoming = ''

Serial1.on('data', function (data) {
  // console.log(data)
  incoming += data
  if (incoming.length > 254) {
    console.log('@ ', incoming)
  }
})

// +CMT: "+447497597953",,"2018/10/14,16:31:05+01">Turnips
// auto answering
// Serial1.println('AT+ATSO=1');
// Serial1.println('ATSO=1');

setTimeout(function () {
  Serial1.println('AT+CMGF=1');
  setTimeout(function () {
    Serial1.println("AT+CMGS=\"07497597953\"\r");
    setTimeout(function () {
      Serial1.println("test message from A6\u001A\r");
    }, 5000);
  }, 5000);
}, 35000);
//



























//
