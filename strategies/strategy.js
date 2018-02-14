let trader = require( '../trader' )

class Strategy {
    constructor(name)
    {
        this.name = name
        this.trader = trader
    }
}

module.exports = Strategy