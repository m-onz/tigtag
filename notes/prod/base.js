

function onInit() {
  SPI1.setup({sck:A5, miso:A6, mosi:A7 });
  E.connectSDCard(SPI1,B1 /*CS*/);
  setTimeout(function () {
	  var fs = require("fs")
	  fs.writeFileSync('demo.txt', JSON.stringify({ a: 11 }))
	  fs.readdirSync()
	  var x = fs.readFileSync('demo.txt').toString()
	  console.log('winning ', x)

    app ()

  }, 5000)
}

function app() {
  var wifi = require('Wifi');
  var http = require('http');
  wifi.disconnect()
  wifi.startAP('TGTG00110011', { password: '01234567899999', authMode: 'wpa2' }, function () {
    console.log('ap running')
    digitalWrite(LED1, 1);
    http.createServer(function (req, res) {
      digitalWrite(LED2, 1);
      try {
        var url = req.url.split('=')[1];
        console.log('hello', url)
      } catch (e) {}
      res.end()
      digitalWrite(LED2, 0);
      digitalWrite(LED1, 0);
    }).listen(80);
  })
}




















//
