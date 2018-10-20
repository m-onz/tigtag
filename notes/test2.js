var wifi;
var WIFI_NAME = "";
var WIFI_OPTIONS = { password : "" };

var wifi = require("EspruinoWiFi");
var http = require("http");
wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
  if (err) {
    console.log("Connection error: "+err);
    return;
  }
  console.log("Connected!");
  getPage();
});

function getPage() {
   http.get("https://duckduckgo.com", function(res) {
    console.log("Response: ",res);
    res.on('data', function(d) {
      console.log("--->"+d);
    });
    res.on('end', function () {
      console.log('end');
    });
  });
}
