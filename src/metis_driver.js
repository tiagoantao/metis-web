import regeneratorRuntime from 'regenerator-runtime'
import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt'
import {sim_do_n_cycles} from '@tiagoantao/metis'


const sleep = (ms) => {
    //XXX Sleep should go to a more general place?
    return new Promise(resolve => {
        setTimeout(() => {resolve()}, ms)
    })
}


export const makeMetisDriver = () => {
    const stack = []
    let run = true
    let count = 0


    const bridge_sim_web = (listener, state, num_cycles) => {
        //XXX The state should be deep copied
        //Currently this is is mutated between source and sink
        sim_do_n_cycles(num_cycles, state, (state, cb) => {
	    listener.next(state)
	    if (cb && state.cycle < 1000) cb() // <1000 is a safeguard
	})
    }


    const report = async (listener) => {
	// XXX Check RxJs Observable.timer for backoff (or xs equiv)
        var backoff = 1
        while (run) {
            await sleep(backoff)
            if (stack.length > 0) {
                const cycles_state = stack.pop().value
		console.log(9999, cycles_state)
		const state = cycles_state.state
		const num_cycles = cycles_state.num_cycles
                console.log(11, stack.length, state, backoff, count)
		count += 1
		bridge_sim_web(listener, state, num_cycles)
                backoff = 1
            }
            else {
                backoff = Math.min(500, 2*backoff)
            }
        }
    }
    

    const metis_driver = (in_state$) => {
        in_state$.addListener({
            next: state => stack.push(state),
            error: () => {},
            complete: () => {}
        })

        const sim_state$ = xs.create({
            start: listener => report(listener),
            stop: () => {run = false}
        })

        return adapt(sim_state$)
    }

    return metis_driver
}
