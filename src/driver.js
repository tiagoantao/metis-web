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
                const cycles_state = stack.pop().value
                console.log(1, stack.length, cycles_state, backoff)
		//XXX The state should be deep copied
		//Currently this is is mutated between source and sink
		sim_cycle(cycles_state.state)
                listener.next(cycles_state.state)
                backoff = 1
            }
            else {
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
