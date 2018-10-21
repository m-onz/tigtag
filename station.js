
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

USB.setConsole(1);

pinMode(A0, 'output');
pinMode(A1, 'output');
pinMode(A4, 'output');

digitalWrite(A0, 0); // green
digitalWrite(A1, 0); // blue
digitalWrite(A4, 1); // red

var at

var RECIPIENT = ''

function send_sms (message) {
  setTimeout(function () {
    at.write("AT+CMGS=\""+RECIPIENT+"\"\r\n");
    setTimeout(function () {
      at.write(message+"\x1A\r");
    }, 2000);
  }, 2000);
}

function onInit() {
  SPI1.setup({ sck: A5, miso: A6, mosi: A7 });
  E.connectSDCard(SPI1,B1 /*CS*/);
  console.log('running gms')
  Serial1.setup(115200, { tx:B6, rx:B7 });
  var fs = require("fs");
  at = require("AT").connect(Serial1);
  at.debug();
  var startup = setInterval(function () {
    at.write("AT\r\n");
  }, 250)
  at.register("+CREG: 1", function () {
    digitalWrite(A4, 0);
    digitalWrite(A0, 1);
    console.log('service running')
    at.write("AT+CMGF=1\r\n");
    // send_sms ('tigtag started')
    app ()
  })
  at.registerLine("tigtag", function (d) {
    var message = d.split('tigtag ')[1]
    console.log(message)
    RECIPIENT = message
    fs.writeFileSync('config.json', JSON.stringify({
      recipient: message
    }))
  });
  setTimeout(function (){
    clearInterval(startup)
  }, 4000)
}

var MOVEMENT_THRESHOLD = 3 // out of 12
var TRIGGER_THRESHOLD = 3
var previous_datapoints = []
var current_score = 0
var ALARM_LEVEL = 0

function tigtag_send_help_message () {
  console.log('.....................')
  console.log('<sms> send help message!!!')
  console.log('.....................')
  send_sms ('tigtag message <somthing is wrong!>')
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
  console.log('> alarm level ', ALARM_LEVEL, ' out of ', TRIGGER_THRESHOLD)
  if (current_score > MOVEMENT_THRESHOLD) {
    ALARM_LEVEL++;
    check_alarm()
  }
  if (current_score <= 1) ALARM_LEVEL = 0 // movement detected!
  previous_datapoints = datapoints
}

function app() {
  var wifi = require('Wifi');
  var http = require('http');
  var fs = require("fs");
  wifi.disconnect()
  // console.log(fs.readFileSync('tigtag.csv'))

  // fs.writeFileSync('config.json', JSON.stringify({
  //   recipient: '+447497597953'
  // }))

  RECIPIENT = JSON.parse(fs.readFileSync('config.json')).recipient

  fs.writeFileSync('tigtag.csv', 'timestamp,ax,ay,az,gx,gy,gz,mx,my,mz,lx,ly,h\n')
  wifi.startAP('TGTG00110011', { password: '01234567899999', authMode: 'wpa2' },
    function () {
    console.log('ap running')
    digitalWrite(A1, 1);
    http.createServer(function (req, res) {
      console.log(req.url)
      digitalWrite(A1, 1);
      if (req.url === '/') {
        var index = E.openFile("admin.html", "r");
        res.writeHead(200, { 'Content-Type': 'text/html' })
        index.pipe(res)
        digitalWrite(A1, 0);
      } else if (req.url.indexOf("?d") > -1) {
         digitalWrite(A1, 1);
         try {
           var data = req.url.split('=')[1];
           tigtag_handle_data_stream (data)
           fs.appendFileSync('tigtag.csv', new Date().toISOString()+','+data+'\n')
         } catch (e) {}
         res.writeHead(200, { 'Content-Type': 'text/plain' })
         res.end('success')
         digitalWrite(A1, 0);
      } else {
        var data = E.openFile("tigtag.csv", "r");
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        data.pipe(res)
        digitalWrite(A1, 0);
      }
      digitalWrite(A1, 0);
    }).listen(80);

  })
}




















//
