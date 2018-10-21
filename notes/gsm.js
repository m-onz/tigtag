
USB.setConsole(1);

pinMode(A0, 'output');
pinMode(A1, 'output');
pinMode(A4, 'output');

digitalWrite(A0, 0); // green
digitalWrite(A1, 0); // blue
digitalWrite(A4, 1); // red

function onInit() {
Serial1.setup(115200, { tx:B6, rx:B7 });
var at = require("AT").connect(Serial1);

at.debug();

var startup = setInterval(function () {
  at.write("AT\r\n");

}, 250)

function send_sms (message) {
  setTimeout(function () {
    at.write("AT+CMGS=\"+447497597953\"\r\n");
    setTimeout(function () {
      at.write(message+"\x1A\r");
    }, 2000);
  }, 2000);
}

at.register("+CREG: 1", function () {
  digitalWrite(A4, 0);
  digitalWrite(A0, 1);
  console.log('service running')
  at.write("AT+CMGF=1\r\n");
  send_sms ('tigtag started')
})

setTimeout(function () {
  send_sms ('tigtag message 2')
}, 30000)

at.registerLine("tigtag", function (d) {
  var message = d.split('tigtag')[1]
  console.log(message)
});

setTimeout(function (){
  clearInterval(startup)
}, 4000)

// Serial1.on('data', console.log)

}
