import Rx from 'rxjs/Rx'

import {
  gn_generate_unlinked_genome,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_randomized_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_rep_SexualReproduction,
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis'


const prepare_sim_state = (pop_size)  => {
  const genome_size = 10

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return new gn_SNP()})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = [
    new ops_rep_SexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_hz_ExpHe()
  ]
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0, integrated_create_randomized_genome)))
  console.log(444, individuals[0])
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
