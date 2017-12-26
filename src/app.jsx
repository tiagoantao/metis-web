import Rx from 'rxjs/Rx'

import {Plot} from './plot'
import {Slider} from './slider'

import {
  gn_generate_unlinked_genome,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_randomized_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis'


const prepare_sim_state = (pop_size) => {
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
  const state = {
    global_parameters: {stop: false},
    individuals, operators, cycle: 0}
  return state
}


export const App = (sources) => {
  const exphe$ = sources.metis.map(state => {
    var cnt = 0
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
	x: state.cycle, y: exphe, marker: 'M' + cnt++}})
  })

  const plot = Plot('vega', {DOM: sources.DOM, vals: exphe$})

  const simulate$ = sources.DOM.select('#simulate')
			   .events('click')
			   .map(ev => parseInt(ev.target.value))
  
  const pop_size_c = Slider({DOM: sources.DOM},
			    {class: '.pop_size', label: 'pop size:',
			     step: 10, min: 10, value: 50, max: 300})

  const num_cycles_c = Slider({DOM: sources.DOM},
			      {class: '.num_cycles', label: 'cycles:',
			       step: 10, min: 10, value: 20, max: 200})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const metis$ = simulate$.map(_ => {
    return Rx.Observable.from([
      {num_cycles, state: prepare_sim_state(100)}
    ])
  })

  const vdom$ = Rx.Observable
		  .combineLatest(pop_size_c.DOM, num_cycles_c.DOM)
		  .map(([pop_size, num_cycles]) =>
    <div>
      <div>
	{pop_size}
	{num_cycles}
	<br/>
	<button id="simulate" value="1">Simulate</button>
      </div>
      <div id="vega"></div>
    </div>      
  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
