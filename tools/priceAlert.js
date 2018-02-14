let _ = require('lodash')
let tickerTracker = require('../tools/tickerTracker')

class PriceAlert
{
    constructor()
    {
    }

    create(targetPrice, side )
    {
        this.hasPriceBeenReached = this.hasPriceBeenReached.bind( this )

        return new Promise( resolve => {

            let fn = currentPrice => {
                if(this.hasPriceBeenReached(currentPrice, targetPrice, side))
                {
                    tickerTracker.removeListener( fn )
                    resolve(currentPrice)
                }
            }

            tickerTracker.addListener( fn )
        })
    }


    hasPriceBeenReached( currentPrice, targetPrice, side )
    {
        let hasReachedAlertPrice = false

        // currentPrice +- startingPrice > alertPrice
        if ( side === 'buy' )
        {
            hasReachedAlertPrice = currentPrice <= targetPrice
        }
        else if (side === 'sell' )
        {
            hasReachedAlertPrice = currentPrice >= targetPrice
        }
        else {
            throw 'Cannot create a price alert for side : ' + side
        }

        return hasReachedAlertPrice
    }
}

module.exports = new PriceAlert()