var fs = require('fs')

var influx = require('influx')
var WebSocketClient = require('websocket').client;
 
var client = new WebSocketClient();
 
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
    console.log('blockchain.info connected');

    var addresses = fs.readFileSync('addresses', {encoding:'utf8'}).split("\n")
    addresses.forEach(function(address){
      console.log('subscribing', address)
      var sub = {op:"addr_sub", addr:address}
      connection.sendUTF(JSON.stringify(sub))
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

client.connect('wss://ws.blockchain.info/inv');

