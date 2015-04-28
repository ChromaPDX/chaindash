// node
var fs = require('fs')

// npm
var influx = require('influx')
var request = require('request')

var config = JSON.parse(fs.readFileSync('config.json'))
 
var db = influx(config)

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

