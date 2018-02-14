let assert = require( 'assert' );
let simple = require( 'simple-mock' )
let trader = require( '../trader' )
let tickerTracker = require( '../tools/tickerTracker' )
let _ = require( 'lodash' )
let stopLoss = require( '../strategies/stop-loss' )
let priceAlert = require( '../tools/priceAlert' )

const pair = 'XBTUSD'

const book = JSON.parse( "{\"asks\":[[\"9271.50000\",\"0.050\",1518637228],[\"9271.60000\",\"0.379\",1518637226],[\"9275.00000\",\"0.100\",1518637180],[\"9277.20000\",\"0.006\",1518637115],[\"9278.90000\",\"0.020\",1518636471],[\"9279.60000\",\"0.030\",1518635247],[\"9280.60000\",\"0.030\",1518636173],[\"9281.00000\",\"2.152\",1518637226],[\"9281.20000\",\"0.030\",1518637229],[\"9282.00000\",\"0.025\",1518636191]],\"bids\":[[\"9271.00000\",\"1.501\",1518637233],[\"9270.10000\",\"5.903\",1518637234],[\"9270.00000\",\"10.750\",1518637226],[\"9266.00000\",\"1.501\",1518637232],[\"9263.80000\",\"0.259\",1518637218],[\"9263.50000\",\"0.054\",1518637222],[\"9262.20000\",\"2.600\",1518637229],[\"9260.00000\",\"0.750\",1518637234],[\"9253.80000\",\"0.004\",1518637182],[\"9253.70000\",\"1.500\",1518637232]]}" )

describe( 'Trading Client', function ()
{
    describe( 'stop-loss', function ()
    {
        it( 'creates a stop loss when limit order is placed below lowest book order', function ( done )
        {
            //(tx, pair, price, volume, side, leverage)
            let tx = "Test_Transaction"
            let stopPrice = 9200
            let volume = 0.0001

            simple.mock( trader, 'getOrderBook' ).resolveWith( book )

            simple.mock( trader, 'addOrder' ).resolveWith( "9271.50000" )

            //simple.mock( trader, 'getLastTickerTradePrice' ).resolveWith( 9269 )

            // stop the tracker. I will call onTick myself
            tickerTracker.stop()

            stopLoss.createStopForBuyOrder( tx, pair, stopPrice, volume )
                .then( result =>
                {
                    simple.restore()
                    console.log( stopPrice )
                    done()
                } );

            tickerTracker.onTick( 9272 )
        } )

        it( 'tries to create stop loss many times if order fails', function ( done )
        {
            //(tx, pair, price, volume, side, leverage)
            let tx = "Test_Transaction"
            let stopPrice = 9200
            let volume = 0.0001

            simple.mock( trader, 'getOrderBook' ).resolveWith( book )

            simple.mock( trader, 'addOrder' ).resolveWith( "9271.50000" )

            //simple.mock( trader, 'getLastTickerTradePrice' ).resolveWith( 9269 )

            // stop the tracker. I will call onTick myself
            tickerTracker.stop()

            stopLoss.createStopForBuyOrder( tx, pair, stopPrice, volume )
                .then( result =>
                {
                    simple.restore()
                    console.log( stopPrice )
                    done()
                } );

            tickerTracker.onTick( 9272 )
        } )
    } )

    describe( 'ticker', function ()
    {
        it( 'should call callback when new price is reported', function ( done )
        {
            tickerTracker.start()

            tickerTracker.addListener( price =>
            {
                tickerTracker.stop()
                console.log( price )
                done()
            } )
        } )
    } )

    describe( 'price alert', function ()
    {
        it( 'should call alert callback when buy price equals', function ( done )
        {
            let alertPrice = 90

            tickerTracker.stop()

            priceAlert.create( alertPrice, 'buy' )
                .then( () =>
                {
                    tickerTracker.stop()
                    simple.restore()
                    done()
                } )

            tickerTracker.onTick( alertPrice )
        } );

        it( 'should call alert callback when buy price goes below', function ( done )
        {
            let alertPrice = 90

            tickerTracker.stop()

            priceAlert.create( alertPrice, 'buy' )
                .then( () =>
                {
                    tickerTracker.stop()
                    simple.restore()
                    done()
                } )

            tickerTracker.onTick( alertPrice - 1 )
        } );

        it( 'should call alert callback when sell price equals', function ( done )
        {
            let alertPrice = 110

            tickerTracker.stop()

            priceAlert.create( alertPrice, 'sell' )
                .then( () =>
                {
                    tickerTracker.stop()
                    simple.restore()
                    done()
                } )

            tickerTracker.onTick( alertPrice )

        } );
        it( 'should call alert callback when buy price goes above', function ( done )
        {
            let alertPrice = 110

            tickerTracker.stop()

            priceAlert.create( alertPrice, 'sell' )
                .then( () =>
                {
                    tickerTracker.stop()
                    simple.restore()
                    done()
                } )

            tickerTracker.onTick( alertPrice + 1 )
        } );
    } );
} );