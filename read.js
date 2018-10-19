
function onInit() {
  SPI1.setup({sck:A5, miso:A6, mosi:A7 });
  E.connectSDCard(SPI1,B1 /*CS*/);
  setTimeout(function () {
	  var fs = require("fs")
	  fs.writeFileSync('demo.txt', JSON.stringify({ a: 11 }))
	  fs.readdirSync()
	  var x = fs.readFileSync('demo.txt').toString()
	  console.log('winning ', x)
  }, 5000)
}
