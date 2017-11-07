import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt'
import {sim_cycle} from '@tiagoantao/metis'

export const makeMetisDriver = () => {
    const stack = []
    let run = true
    stack.listeners = []
    stack.push = (elem) => {
        for (listener of listeners) {
            listener.call(event)
        }
    }
    
    const metis_driver (in_state$) {
        in_state$.addListener({
            next: state => {stack.push(state)},
            error: () => {},
            complete: () => {}
        })

        const sim_state$ = xs.create({
            start: listener => {
                while (run) {
                }
            },
            stop: () => {run = false}
        })

        return adapt(sim_state$)
    }

    return metis_driver
}
