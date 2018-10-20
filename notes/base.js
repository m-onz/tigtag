
E.on('init', function() {
  USB.setConsole();
});

Serial1.setup(115200, { tx:B6, rx:B7 });

Serial1.on('data', function (data) {
  console.log(data)
  // Serial1.print(data);
})

// +CMT: "+447497597953",,"2018/10/14,16:31:05+01">Turnips
// auto answering
// Serial1.println('AT+ATSO=1'); ?
// Serial1.println('ATSO=1'); ?

setTimeout(function () {
  Serial1.println('AT+CMGF=1');
  setTimeout(function () {
    Serial1.println("AT+CMGS=\"07497597953\"\r");
    setTimeout(function () {
      Serial1.println("test message from A6\u001A\r");
    }, 5000);
  }, 5000);
}, 5000);
