
function onInit() {
Serial1.setup(115200, { tx:B6, rx:B7 });
var at = require("AT").connect(Serial1);

// Return some debug data, but also enable debug mode.
// Debug mode prints out what is sent and received
at.debug();

var startup = setInterval(function () {
  at.write("AT\r\n");
}, 250)

setTimeout(function (){
  clearInterval(startup)
}, 4000)

setTimeout(function() {
  at.write("AT+CMGF=1\r\n");
}, 30000)
// Serial1.on('data', console.log)
// setTimeout(function () {
//   Serial1.println('AT+CMGF=1\r');
//   setTimeout(function () {
//     Serial1.println("AT+CMGS=\"+447497597953\"\r");
//     setTimeout(function () {
//       Serial1.println("you are a smeg head\u001A\r");
//     }, 5000);
//   }, 5000);
// }, 65000);
}
