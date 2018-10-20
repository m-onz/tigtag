var once = true;
// USB.setConsole(1);
Serial1.setup(115200, { tx:B6, rx:B7 });

var wait = setInterval(function () {
  Serial1.write('AT\r')
}, 1000)

setTimeout(function () {
  Serial1.on('data', function (data) {
    console.log(data)
    if (data.indexOf("OK") > -1 && once) {
      once = false;
      clearInterval(wait)
      setTimeout(function () {
      console.log('set to sms mode!')
      // Serial1.println("AT+CMGD=1,4");
      // setTimeout(function () {
      Serial1.println('AT+CMGF=1\r');
      // }, 5000)
        setTimeout(function () {
          Serial1.println('AT+CMGR=1\r')
        //   Serial1.println("AT+CMGS=\"+447497597953\"\r");
        //   setTimeout(function () {
        //     Serial1.println("test message from A6\u001A\r");
        //   }, 5000);
        }, 5000);
      }, 10000);
    }
  })
}, 9000)


//
//
// var ATSMS = require("ATSMS");
// var sms = new ATSMS(Serial1);
//
// sms.serial.on('data', function (data) {
//   console.log(data)
// })
//
// sms.init(function(err) {
//   if (err) throw err;
//   console.log("Initialised!");
//
//   // sms.list("ALL", function(err,list) {
//   //   if (err) throw err;
//   //   if (list.length)
//   //     console.log(list);
//   //   else
//   //     console.log("No Messages");
//   // });
//
//   // and to send a message:
//   //sms.send('+441234567890','Hello world!', callback)
// });
//
// sms.on('message', function(msgIndex) {
//   console.log("Got message #",msgIndex);
//   sms.get(msgIndex, function(err, msg) {
//     if (err) throw err;
//     print("Read message", msg);
//     // delete all messages to stop us overflowing
//     sms.delete("ALL");
//   });
// });



/*

// Serial1.setup(115200, { tx:B6, rx:B7 });
// //
// // // var incoming = ""
// //
// Serial1.on('data', function (data) {
//   console.log(data)
// })
//   // if (data.length <= 4) {
//   //   console.log(incoming)
//   //   incoming += data
//   //   // MESS
//   //   if (incoming.indexOf("+CREG: 1") > 1) {
//   //     console.log("message >>>", incoming)
//   //     console.log(">>>>")
//   //   }
//   //   incoming = ""
//   // } else {
//   //   incoming += data
//   // }
// })

// +CMT: "+447497597953",,"2018/10/14,16:31:05+01">Turnips
// auto answering
// Serial1.println('AT+ATSO=1');
// Serial1.println('ATSO=1');


// console.log('attempting to delete all stored messages')


// Serial1.println("AT+CMGD=1,4");

// setTimeout(function () {
//   Serial1.println('AT+CMGF=1');
//
//   // Serial1.println("AT+CMGR=1")
//
//   setTimeout(function () {
//     Serial1.println("AT+CMGS=\"+447497597953\"\r");
//     setTimeout(function () {
//       Serial1.println("test message from A6\u001A\r");
//     }, 5000);
//   }, 35000);
//
// //
// }, 35000)
/* Copyright (c) 2017 Gordon Williams. See the file LICENSE for copying permission. */
/* Simple SMS send/receive library */

/** This initialises the modem on the specified serial port.
'options' is not currently used.

Once initialised, new messages will fire a `message`
event. You must then call `.list` to get unread messages.
*/

/*

function ATSMS(serial, options) {
  var sms = this;
  this.serial = serial;
  this.at = require("AT").connect(serial);
  // this.at.registerLine("+CMTI: \"SM\",", function(d) {
  //   sms.emit("message", d.substr(12));
  //   return "";
  // });
  this.serial.on('data', console.log)
}

ATSMS.prototype.init = function(callback) {
  var at = this.at;
  setTimeout(function () {
    // if (d=="ATE0") return cb;
    // if (d!="OK") callback("ATE0 ERROR "+d);
    at.cmd("AT+CMGF=1\r\n",1000,function(d) {
      // if (callback) callback(d=="OK"?null:("CMGF ERROR "+d));
      if (callback) callback(null)
    });
  }, 60000);
};


ATSMS.prototype.send = function(number, text, callback) {
  var at = this.at;
  // at.register('>', function() {
  //   at.unregister('>');
  //   at.write(text+"\x1A\r");
  //   return "";
  // });
  at.cmd('AT+CMGS="'+number+'"\r\n',10000,function cb(d) {
    // at.unregister('>');
    // if (d && d.substr(0,5)=="+CMGS") return cb;
    // if (callback) callback(d=="OK"?null:("CMGS ERROR "+d));
    at.write("test message from A6\u001A\r\n")
    setTimeout(function () {
      callback(null)
    }, 1000)
  });
};

function decodeSMSContent(d) {
  if ((d.length&3)!=0) return d;
  var txt = "";
  for (var i=0;i<d.length;i+=4) {
    var n = parseInt(d.substr(i,4),16);
    if (!isNaN(n)) {
      txt += String.fromCharCode(n);
    } else {
      return d;
    }
  }
  return txt;
}

ATSMS.prototype.list = function(index, callback) {
  var at = this.at;
  var list = [];
  var currItem;
  at.cmd('AT+CMGL="'+index+'"\r\n',10000,function cb(d) {
    // Handle the text that comes after message record
    if (currItem!==undefined && d!==undefined) {
      currItem.text = decodeSMSContent(d);
      currItem = undefined;
      return cb;
    }
    // Handle message record
    if (d && d.substr(0,7)=="+CMGL: ") {
      try {
        var rec = JSON.parse("["+d.substr(7)+"]");
        currItem = {
          index : rec[0],
          isRead : rec[1]=="REC READ",
          oaddr : rec[2],
          oname : rec[3],
          time : rec[4],
          text : "",
        };
        list.push(currItem);
      } catch (e) { }
      return cb;
    }
    if (callback) callback(d=="OK"?null:("CMGL ERROR "+d), list);
  });
};

ATSMS.prototype.get = function(index, callback) {
  var at = this.at;
  var currItem;
  at.cmd('AT+CMGR='+index+'\r\n',10000,function cb(d) {
    if (d=="OK") return callback(null, currItem);
    // Handle the text that comes after message record
    if (currItem!==undefined && d!==undefined && d!="OK") {
      currItem.text = decodeSMSContent(d);
      return cb;
    }
    // Handle message record
    if (d && d.substr(0,7)=="+CMGR: ") {
      try {
        var rec = JSON.parse("["+d.substr(7)+"]");
        currItem = {
          isRead : rec[0]=="REC READ",
          oaddr : rec[1],
          oname : rec[2],
          time : rec[3],
          text : "",
        };
      } catch (e) { }
      return cb;
    }
    if (callback) callback(d=="OK"?null:("CMGR ERROR "+d), list);
  });
};

ATSMS.prototype.delete = function(index, callback) {
  if (index=="ALL") index="1,4";
  this.at.cmd("AT+CMGD="+index+"\r\n",1000,function cb(d) {
    if (callback) callback(d=="OK"?null:("CMGD ERROR "+d));
  });
};


pinMode(A0, 'output');
pinMode(A1, 'output');
pinMode(A4, 'output');
//
digitalWrite(A0, 0); // green
digitalWrite(A1, 0); // blue
digitalWrite(A4, 0); // red

digitalWrite(A4, 1); // red

USB.setConsole(1)
Serial1.setup(115200, { rx: B7, tx : B6 });
// var ATSMS = require("ATSMS");

var sms = new ATSMS(Serial1);
//Use
// sms.at.debug(); //here if you want debug messages

sms.init(function(err) {
  if (err) throw err;
  console.log("Initialised!");
  digitalWrite(A4, 0); // red
  digitalWrite(A0, 1);

  // sms.list("ALL", function(err,list) {
  //   if (err) throw err;
  //   if (list.length)
  //     console.log(list);
  //   else
  //     console.log("No Messages");
  // });
  //
  // // and to send a message:
  sms.send('+447497597953','Hello world!', function (e) {
    console.log(e)
  })
});
sms.on('message', function(msgIndex) {
  console.log("Got new message, index ", msgIndex);
});



*/
