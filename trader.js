require('dotenv').config()

let KrakenClient = require( './kraken' )

class Trader
{
    constructor()
    {
        this.login(process.env.API_KEY, process.env.SECRET)
    }

    login( key, secret )
    {
        this.client = new KrakenClient( key, secret )

        this.ordertype = {
            'market': 'market',
            'limit': 'limit',
            'stop-loss': 'stop-loss',
            'take-profit': 'take-profit',
            'stop-loss-profit': 'stop-loss-profit',
            'stop-loss-profit-limit': 'stop-loss-profit-limit',
            'stop-loss-limit': 'stop-loss-limit',
            'take-profit-limit': 'take-profit-limit',
            'trailing-stop': 'trailing-stop',
            'trailing-stop-limit': 'trailing-stop-limit',
            'stop-loss-and-limit': 'stop-loss-and-limit',
            'settle-position': 'settle-position'
        }

        this.debug = false;
    }

    /*
    pair = asset pair
type = type of order (buy/sell)
ordertype = order type:
    market
    limit (price = limit price)
    stop-loss (price = stop loss price)
    take-profit (price = take profit price)
    stop-loss-profit (price = stop loss price, price2 = take profit price)
    stop-loss-profit-limit (price = stop loss price, price2 = take profit price)
    stop-loss-limit (price = stop loss trigger price, price2 = triggered limit price)
    take-profit-limit (price = take profit trigger price, price2 = triggered limit price)
    trailing-stop (price = trailing stop offset)
    trailing-stop-limit (price = trailing stop offset, price2 = triggered limit offset)
    stop-loss-and-limit (price = stop loss price, price2 = limit price)
    settle-position
price = price (optional.  dependent upon ordertype)
price2 = secondary price (optional.  dependent upon ordertype)
volume = order volume in lots
leverage = amount of leverage desired (optional.  default = none)
oflags = comma delimited list of order flags (optional):
    viqc = volume in quote currency (not available for leveraged orders)
    fcib = prefer fee in base currency
    fciq = prefer fee in quote currency
    nompp = no market price protection
    post = post only order (available when ordertype = limit)
starttm = scheduled start time (optional):
    0 = now (default)
    +<n> = schedule start time <n> seconds from now
    <n> = unix timestamp of start time
expiretm = expiration time (optional):
    0 = no expiration (default)
    +<n> = expire <n> seconds from now
    <n> = unix timestamp of expiration time
userref = user reference id.  32-bit signed number.  (optional)
validate = validate inputs only.  do not submit order (optional)

optional closing order to add to system when order gets filled:
    close[ordertype] = order type
    close[price] = price
    close[price2] = secondary price
     */

    addOrder( pair, type, ordertype, price, volume, leverage )
    {
        let method = 'AddOrder'

        leverage = leverage || 'none'

        let params = {
            pair,
            type,
            ordertype,
            price,
            //price2: '',
            volume,
            leverage,
            //oflags: '',
            //starttm: '',
            //expiretm: '',
            //userref: '',
            //validate: ''
        }

        return this.client.privateMethod( method, params )
    }

    cancelOrder(txid)
    {
        let method = 'CancelOrder'

        let params = { txid }
        return this.client.privateMethod( method, params )
            .then( result => {
                console.log('CANCEL ORDER: \r\n' + JSON.stringify(result))
                this.log('cancelOrder', result)

                return result
            })
            .catch( err => {
                this.logError('cancelOrder', err)
                throw err
            })
    }

    /*
    info = info to retrieve (optional):
    info = all info (default)
    leverage = leverage info
    fees = fees schedule
    margin = margin info
pair = comma delimited list of asset pairs to get info on (optional.  default = all)
     */
    assetPairs( pair )
    {
        let method = 'AssetPairs'

        let params = {
            pair
        }

        return this.client.publicMethod( method, params )
    }

    getTicker( pair )
    {
        let method = 'Ticker'

        let params = { pair }

        return this.client.publicMethod( method, params )
            .then( result => {
                this.log('getTicker', result)
                return result
            })
            .catch( err => {
                this.logError('getTicker', err)
                throw err
            })
    }

    getOrderBook( pair, count )
    {
        let method = 'Depth'

        let params = { pair, count: count || 10 }

        return this.client.publicMethod( method, params )
            .then( result => {
                let book = Object.values(result)[0]
                this.log('getOrderBook', book)
                return book
            })
            .catch( err => {
                this.logError('getOrderBook', err)
                throw err
            })
    }

    getLastTickerTradePrice( pair )
    {
        return this.getTicker( pair )
            .then( result => {
                let price = Object.values(result)[0].c[0]
                this.log('getLastTickerTradePrice', price)

                return price
            })
            .catch( err => {
                this.logError('getLastTickerTradePrice', err)
                throw err
            })

    }

    getTrade( pair )
    {
        let method = 'Trades'

        let params = { pair }

        return this.client.publicMethod( method, params )
    }

    getOpenOrders()
    {
        let method = 'OpenOrders'

        let params = { trades: true }

        return this.client.privateMethod( method, params )
    }

    getClosedOrders()
    {
        let method = 'ClosedOrders'

        let params = { trades: true }

        return this.client.privateMethod( method, params )
    }

    log(name, result)
    {
        if(!this.debug)
        {
            return
        }

        let message = result
        if(typeof result === 'object')
        {
            message = JSON.stringify(result)
        }

        console.log('------------------------------------------------')
        console.log(name + '\r\n' + message)
    }

    logError(name, err)
    {
        console.log('------------------------------------------------')
        console.error(name + '\r\n' + err)
    }
}

module.exports = new Trader()