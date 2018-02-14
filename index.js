require('dotenv').config()

let trader = require('./trader')
let stopLoss = require('./strategies/stop-loss')
let pair = 'XBTUSD'

trader.login(process.env.API_KEY, process.env.SECRET)

trader.debug = true

// trader.assetPairs('XBTUSD')
//     .then( result => console.log(result))
//     .catch( err => console.log('err: ' + err))

//console.log('ADD ORDER')
// trader.addOrder('XBTUSD', 'sell', trader.ordertype.limit, '11000.0', '0.01')
//     .then( result => console.log(result))
//     .catch( err => console.log('err: ' + err))

// trader.addOrder('XBTUSD', 'buy', trader.ordertype.limit, '10000.0', '0.01')
//     .then( result => {
//         console.log(result)
//     })
//     .catch( err => {
//         console.log('err: ' + err)
//     })

let priceThatShouldExecutStop = 9200 // this price is below my make believe buy of 9300 and I want to stop out
stopLoss.createStopForBuyOrder( "unknown", pair, priceThatShouldExecutStop, 0.001 )
    .then( result =>
    {
        console.log( result )
    } )
    .catch( err => {
        console.log('err: ' + err)
    })

// trader.cancelOrder('O3VY7I-ARJDO-LHWVPE')
//     .then( result => console.log(result))
//     .catch( err => console.log('err: ' + err))

// console.log('GET OPEN ORDERS')
// trader.getOpenOrders('XBTUSD')
//     .then( result => console.log(JSON.stringify(result) ))
//     .catch( err => console.log('err: ' + err))



//trader.getLastTickerTradePrice(pair)
// trader.getOrderBook(pair)
//     .then( book => {
//         console.log(book)
//     })
