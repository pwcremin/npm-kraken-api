// TODO rename trader
let trader = require( '../trader' )


class TickerTracker
{
    constructor( pair )
    {
        this.pair = pair
        this.start()
    }


    start()
    {
        // TODO can only track one pair right now
        if(this.id)
        {
            // already running
            return
        }

        // trader.getLastTickerTradePrice( pair )
        //     .then(price => this.startingPrice = price)

        this.alert = null

        this.id = setInterval( () =>
        {
            trader.getLastTickerTradePrice( this.pair )
                .then( price =>
                {
                    this.onTick( price )
                } )
        }, 2000 )

        this.listeners = []
    }

    stop() {
        this.listeners = []
        clearInterval( this.id )
        this.id = null
    }

    addListener( fn )
    {
        this.listeners.push( fn )
    }

    removeListener( fn )
    {
        this.listeners = this.listeners.filter(
            function ( item )
            {
                if ( item !== fn )
                {
                    return item;
                }
            }
        );
    }

    // setPriceAlert( side, price, alertCallback )
    // {
    //     this.alert = new PriceAlert( price, side, alertCallback )
    // }

    onTick( price )
    {
        this.listeners.forEach( fn => fn( price ) )
    }
}


module.exports = new TickerTracker('XBTUSD') // TODO for now only track xbt.  fix for more later