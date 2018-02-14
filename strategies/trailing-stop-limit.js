/*
    A trailing stop limit order is designed to allow an investor to specify a limit on the maximum possible loss,
    without setting a limit on the maximum possible gain. A SELL trailing stop limit moves with the market price,
    and continually recalculates the stop trigger price at a fixed amount below the market price, based on the user-defined
    "trailing" amount. The limit order price is also continually recalculated based on the limit offset. As the market
    price rises, both the stop price and the limit price rise by the trail amount and limit offset respectively, but if
    the stock price falls, the stop price remains unchanged, and when the stop price is hit a limit order is
    submitted at the last calculated limit price. A "Buy" trailing stop limit order is the mirror image of a sell
    trailing stop limit, and is generally used in falling markets.
 */

let trader = require( '../trader' )


class TrailingStopLimit
{

    constructor()
    {
        this.tx = {}
        this.intervals = []
    }

    // create an order with a trailing stop limit
    async create( txId, type, pair, volume, priceDelta, leverage )
    {
        let price = await trader.getLastTickerTradePrice( pair )

        this.tx[ txId ] = {
            pair,
            type,
            volume,
            lastPrice: price,
            priceDelta,
            leverage: leverage
        }

        let intervalId = setInterval( () =>
        {

            this._processTrailingStop( txId )
        }, 1000 )

        this.tx[ txId ].intervalId = intervalId

        trader.addOrder()
    }

    async _processTrailingStop( txId )
    {
        let price = await trader.getLastTickerTradePrice( this.tx[ txId ].pair )

        let isBreached = this._isPriceDeltaBreached( txId, price )

        if ( isBreached )
        {
            clearInterval( this.tx[ txId ].intervalId )

            this._stopOrder( txId )
        }
        else
        {
            this.tx[ txId ].lastPrice = price
        }
    }

    _isPriceDeltaBreached( txId, price )
    {
        // Cant do abs.. could go way beyond.  Need to see if selling or buying and subtract correctly
        let isBreached = false
        let lastPrice = this.tx[ txId ].lastPrice
        let priceDelta = this.tx[ txId ].priceDelta

        if ( this.tx[ txId ].type === 'buy' )
        {
            let delta = lastPrice - price
            isBreached = delta > priceDelta || delta < 0
        }
        else
        {
            let delta = price - lastPrice
            isBreached = delta > priceDelta || delta < 0
        }
        return isBreached
    }

    _stopOrder( txId )
    {
        // I guess create a limit order just above the last price?... need to get the order book price
        // and put it there.. but hard to do a limit buy into a market moving up.  F-it.  Market order

        let type = this.tx[ txId ].type === 'buy' ? 'sell' : 'buy'

        let side = type === 'buy' ? "bids" : "asks"

        let book = trader.getOrderBook( this.tx[ txId ].pair )[ side ]

        let limitPrice = book[ 0 ]

        trader.addOrder( this.tx[ txId ].pair, type, limitPrice, this.tx[ txId ].volume, this.tx[ txId ].leverage )
            .then( result =>
            {
                // limit order - may not get filled if price suddenly reverses.  So need to set a flag
                // and remove this limit order if it goes the other way

                console.log( txId + ': Limit ' + type + ' order placed at ' + limitPrice )
            } )
            .catch( err =>
            {
                // maybe it couldnt go through because the price move.  Try and stop it again
                // TODO figure out the error code for the above case and only stopOrder again in that case
                this._stopOrder( txId )
            } )
    }

}

module.export = new TrailingStopLimit()