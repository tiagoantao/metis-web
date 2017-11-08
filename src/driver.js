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
                backoff = 1
                const state = stack.push()
                console.log(1, state, backoff)
            }
            else {
                console.log(2, backoff)
                backoff = Math.min(500, 2*backoff)
            }
        }
    }
    
    const metis_driver = (in_state$) => {
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
