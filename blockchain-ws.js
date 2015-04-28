// node
var fs = require('fs')

// npm
var influx = require('influx')
var WebSocketClient = require('websocket').client;
var request = require('request')
 
var client = new WebSocketClient();
 
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
    console.log('blockchain.info connected');

    var addresses = fs.readFileSync('addresses', {encoding:'utf8'}).split("\n")
    addresses.forEach(function(address){
      if(address.length == 34) {
        console.log('subscribing', address)
        var sub = {op:"addr_sub", addr:address}
        connection.sendUTF(JSON.stringify(sub))
      }
    })

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        console.log(message)

        var point = { balance : 100, time : new Date()};
        db.writePoint('dust', point)

        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
});
 

var db = influx({
  host : 'localhost',
  username : 'root',
  password : 'root',
  database : 'chroma'
});

db.getSeriesNames('chroma', function(err,arraySeriesNames){
  console.log(arraySeriesNames)
} ) 


function balanceRefresh(address) {
        request.get('https://blockchain.info/q/addressbalance/'+address, 
          function(e,r){ 
            var satoshi = parseInt(r.body)
            var btc = satoshi / 100000000
            console.log('dust', btc) 
            var point = { balance: btc, time : new Date()};
            db.writePoint('dust', point)
          })
}

function balancesCheck() {
    var addresses = fs.readFileSync('addresses', {encoding:'utf8'}).split("\n")
    addresses.forEach(function(address){
      if(address.length == 34) {
        balanceRefresh(address)
      }
    })
}

balancesCheck()
setInterval(balancesCheck, 100*60*5)
//client.connect('wss://ws.blockchain.info/inv');

