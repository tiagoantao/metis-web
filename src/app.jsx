import Rx from 'rxjs/Rx'

import {
  i_assign_random_sex,
  i_generate_basic_individual,
  ops_culling_KillOlderGenerations,
  ops_rep_NoGenomeSexualReproduction,
  ops_stats_demo_SexStatistics,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis'


const prepare_sim_state = (pop_size)  => {
  const operators = [
    new ops_rep_NoGenomeSexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics()]

  const species = new sp_Species()
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(i_generate_basic_individual(species)))
  const state = {
    global_parameters: {stop: false},
    individuals, operators, cycle: 1}
  return state

}

export const App = (sources) => {
  const num_cycles$ = sources.DOM.select('#num_cycles')
    .events('change')
    .map(ev => parseInt(ev.target.value))
    .startWith(50)
    .subscribe(x => num_cycles = x)

  let num_cycles = 0

  const simulate$ = sources.DOM.select('#simulate')
    .events('click')
    .map(ev => parseInt(ev.target.value))
    .startWith(0)

  const test$ = simulate$.map(_num_cycles =>
    Rx.Observable.from([
//      {num_cycles, state: prepare_sim_state(50)},
      {num_cycles, state: prepare_sim_state(100)}
    ]))

  sources.metis.subscribe(x => console.log(x, 10))
  
  const vdom$ = simulate$.map(_num_cycles =>
    <div>
      <div>
        <input type="number" id="num_cycles" value="{num_cycles}"/>
        <button id="simulate" value="1">Simulate</button>
      </div>
      <div>bla {String(num_cycles)}
      </div>
    </div>      
      )

  const sinks = {
    DOM: vdom$,
    metis: test$
  }
  
  return sinks
}
