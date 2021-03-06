import Rx from 'rxjs/Rx'
import {run} from '@cycle/rxjs-run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
import {makeMetisDriver} from './metis_driver'

const main = App

const drivers = {
    DOM:  makeDOMDriver('#metis'),
    metis: makeMetisDriver()
}

run(main, drivers)
