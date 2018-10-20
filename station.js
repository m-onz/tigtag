
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
    console.log('tigtag.csv ', fs.readFileSync('tigtag.csv'));
    // fs.writeFileSync('tigtag.csv', '')
    http.createServer(function (req, res) {
      console.log(req.url)
      if (req.url.indexOf("?d") > -1) {
        digitalWrite(LED2, 1);
        try {
          var data = req.url.split('=')[1];
          console.log('would write ', data)
          // fs.appendFileSync('tigtag.csv', new Date().toISOString()+','+data+'\n')
        } catch (e) {}
        res.end()
      } else {
        res.end ('turnips')
      }
      digitalWrite(LED2, 0);
      digitalWrite(LED1, 0);
    }).listen(80);
  })
}




















//
