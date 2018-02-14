/*
A stop-loss order is an order placed with a broker to sell a security when it reaches a certain price. Stop loss orders are designed to limit an investor’s loss on a position in a security. Although most investors associate a stop-loss order with a long position, it can also protect a short position, in which case the security gets bought if it trades above a defined price.

Read more: Stop-Loss Order https://www.investopedia.com/terms/s/stop-lossorder.asp#ixzz575tcna88
Follow us: Investopedia on Facebook
 */

let Strategy = require( './strategy' )
let tickerTracker = require( '../tools/tickerTracker' )
let priceAlert = require( '../tools/priceAlert' )

class StopLoss extends Strategy
{

    constructor()
    {
        super( 'StopLoss' )
    }

    createStopForBuyOrder( tx, pair, price, volume, leverage )
    {
        let type = 'buy'
        let side = 'asks'

        return this._createStop( tx, pair, price, volume, side, type, leverage )
    }

    createStopForSellOrder( tx, pair, price, volume, leverage )
    {
        let type = 'sell'
        let side = 'bids'

        return this._createStop( tx, pair, price, volume, side, type, leverage )
    }

    _createStop(  tx, pair, price, volume, side, type, leverage  )
    {
        return priceAlert.create( price, type )
            .then( () =>
            {
                return this._createStopLossLimitOrder( tx, pair, price, volume, side, leverage )
            } )
    }

    _createStopLossLimitOrder( tx, pair, price, volume, side, leverage )
    {
        // create a limit order to sell or buy

        return this.trader.getOrderBook( pair )
            .then( book =>
            {
                // create a new limit order at the bottom of the book
                let orderPrice = book[ side ][ 0 ][ 0 ]

                console.log( '[' + tx + '] Attempting to create stop loss limit order at ' + orderPrice )

                this.trader.addOrder( pair, this.trader.ordertype.limit, orderPrice, volume, leverage )
                    .then( result =>
                    {
                        // TODO get the transation number from the result
                        console.log( '[' + tx + '] Stop loss limit order created: ' + orderPrice )
                        return result
                    } )
                    .catch( err =>
                    {
                        // TODO this shouldnt happen.  Kraken will just place the limit order at the
                        // top if the book if you make it too big or small in the wrong direction
                        // (buy limit order above the bottom of the sell side)
                        return this._createStopLossLimitOrder( orderPrice )
                    } )
            } )
    }
}

module.exports = new StopLoss()