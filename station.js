
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

var MOVEMENT_THRESHOLD = 6 // out of 12
var TRIGGER_THRESHOLD = 3
var previous_datapoints = []
var current_score = 0
var ALARM_LEVEL = 0

function tigtag_send_help_message () {
  console.log('.....................')
  console.log('<sms> send help message!!!')
  console.log('.....................')
}

function check_alarm () {
  if (ALARM_LEVEL > TRIGGER_THRESHOLD) {
    tigtag_send_help_message ()
    ALARM_LEVEL = 0
  }
}

function tigtag_handle_data_stream (data) {
  var _datapoints = data.split(',')
  var datapoints = _datapoints.map(function (i) { return parseFloat(i) })
  current_score = 0;
  previous_datapoints.forEach(function (item, index) {
    if (datapoints[index] === item) {
      current_score++;
    }
  })
  console.log('> score ', current_score)
  if (current_score > MOVEMENT_THRESHOLD) {
    ALARM_LEVEL++;
    check_alarm()
  }
  previous_datapoints = datapoints
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
      if (req.url === '/') {
        var index = E.openFile("admin.html", "r");
        res.writeHead(200, { 'Content-Type': 'text/html' })
        index.pipe(res)
      } else if (req.url.indexOf("?d") > -1) {
         digitalWrite(LED2, 1);
         try {
           var data = req.url.split('=')[1];
           tigtag_handle_data_stream (data)
           fs.appendFileSync('tigtag.csv', new Date().toISOString()+','+data+'\n')
         } catch (e) {}
      } else {
        var data = E.openFile("tigtag.csv", "r");
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        data.pipe(res)
      }
    }).listen(80);
  })
}




















//
