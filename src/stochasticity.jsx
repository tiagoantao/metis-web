import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'


import {
  gn_generate_unlinked_genome,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_freq_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_FreqAl,
  ops_wrap_list,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, freq_start) => {
  const genome_size = 1

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return new gn_SNP()})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_FreqAl()
  ])
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0,
      (ind) => integrated_create_freq_genome(freq_start / 100, ind))))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const StochasticityApp = (sources) => {
  const tag = 'stochasticity'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  var freq_cycle = 1000
  var freq_cnt = 0
  const freqal$ = my_metis$.map(state => {
    if (state.cycle < freq_cycle) {
      freq_cnt ++
    }
    freq_cycle = state.cycle

    const freqal = state.global_parameters.FreqAl.unlinked[0]
    return [{x: state.cycle, y: freqal, marker: 'Sim' + freq_cnt}]
  })

  const freq_start_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-freq_start',
     label: 'Starting frequency of the derived allele (%)',
     step: 1, min: 1, value: 50, max: 99})
  let freq_start
  freq_start_c.value.subscribe(v => freq_start = v)
  
  const pop_size_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-pop_size',
     label: 'Population size',
     step: 10, min: 10, value: 50, max: 300})
  let pop_size
  pop_size_c.value.subscribe(v => pop_size = v)
  
  const num_cycles_c = Slider(
    {DOM: sources.DOM},
    {className: '.' + tag + '-num_cycles', label: 'Cycles',
     step: 10, min: 10, value: 20, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const freqal_plot = Plot(
    {clean: false,
     id: tag + '-freqal', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: freqal$})
  
  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

  simulate$.subscribe((x) => console.log(2123, x))

  const metis$ = simulate$.map(_ => {
    const init = {
      num_cycles,
      state: prepare_sim_state(tag, pop_size, 100 - freq_start)
    }
    return init
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
		    freq_start_c.DOM, pop_size_c.DOM,
		    num_cycles_c.DOM,
		    freqal_plot.DOM)
                  .map(([freq_start, pop_size, num_cycles,
			 freqal]) =>
                    <div>
                      <div>
                        {freq_start}
                        {pop_size}
                        {num_cycles}
                        <br/>
                        <button id={tag} value="1">Simulate</button>
                      </div>
		      {freqal}
                    </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
