import regeneratorRuntime from 'regenerator-runtime'
import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt'
import {sim_cycle} from '@tiagoantao/metis'

const sleep = (ms) => {
    //XXX Sleep should go to a more general place?
    return new Promise(resolve => {
        setTimeout(() => {resolve()}, ms)
    })
}

export const makeMetisDriver = () => {
    const stack = []
    let run = true

    const report = async (listener) => {
        var backoff = 1
        while (run) {
            await sleep(backoff)
            if (stack.length > 0) {
                const state = stack.pop().value
                console.log(1, stack.length, state, backoff)
		listener.next(state)
                backoff = 1
            }
            else {
                backoff = Math.min(500, 2*backoff)
            }
        }
    }
    
    const metis_driver = (in_state$) => {
        console.log(123)
        in_state$.addListener({
            next: state => {stack.push(state)},
            error: () => {},
            complete: () => {}
        })

        const sim_state$ = xs.create({
            start: listener => {report(listener)},
            stop: () => {run = false}
        })

        return adapt(sim_state$)
    }

    return metis_driver
}
