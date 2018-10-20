
//  station

/*

  gsm A6
  SD Card
  wifi access point

  receive pings from node.
  save to storage.

  web page for configuration.
  serve file using pipe.

*/

function onInit() {
  SPI1.setup({ sck: A5, miso: A6, mosi: A7 });
  E.connectSDCard(SPI1,B1 /*CS*/);
  setTimeout(function () {
    app ()
  }, 5000)
}

function app() {
  var wifi = require('Wifi');
  var http = require('http');
  var fs = require("fs");
  wifi.disconnect()
  wifi.startAP('TGTG00110011', { password: '01234567899999', authMode: 'wpa2' },
    function () {
    console.log('ap running')
    digitalWrite(LED1, 1);
    http.createServer(function (req, res) {
      console.log(req.url)
      if (req.url.indexOf("?d") > -1) {
         digitalWrite(LED2, 1);
         try {
           var data = req.url.split('=')[1];
           fs.appendFileSync('tigtag.csv', new Date().toISOString()+','+data+'\n')
         } catch (e) {}
      } else if (req.url.indexOf("/tigtag.csv")) {
        var data = E.openFile("tigtag.csv", "r");
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        data.pipe(res)
      } else {
        var index = E.openFile("admin.html", "r");
        res.writeHead(200, { 'Content-Type': 'text/html' })
        index.pipe(res)
      }
    }).listen(80);
  })
}




















//
