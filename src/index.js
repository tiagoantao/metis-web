import Rx from 'rxjs/Rx'
import {run} from '@cycle/rxjs-run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
import {makeMetisDriver} from './driver'

const main = App

const drivers = {
  DOM: makeDOMDriver('#root')
}

const drv = makeMetisDriver()

const in$ = Rx.Observable.from([1, 2])
const out$ = drv(in$)
console.log(out$)
run(main, drivers)
