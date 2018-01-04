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
  ops_stats_hz_ExpHe,
  ops_stats_NumAl,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, freq_start) => {
  const genome_size = num_markers

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return new gn_SNP()})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = [
    new ops_rep_SexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_NumAl(),
    new ops_stats_hz_ExpHe()
  ]
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0,
      (ind) => integrated_create_freq_genome(freq_start / 100, ind))))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 0}
  return state
}


export const SimpleFreqApp = (sources) => {
  const tag = 'simple-freq'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle, y: exphe, marker: 'M' + cnt++}})
  })

  const numal$ = my_metis$.map(state => {
    var cnt = 0
    return state.global_parameters.NumAl.unlinked.map(numal => {
      return {
        x: state.cycle, y: numal, marker: 'M' + cnt++}})
  })
  
  const freq_start_c = Slider({DOM: sources.DOM},
                              {className: '.' + tag + '-freq_start', label: 'freq start (%):',
                               step: 1, min: 1, value: 50, max: 99})
  let freq_start
  freq_start_c.value.subscribe(v => freq_start = v)
  
  const pop_size_c = Slider({DOM: sources.DOM},
                            {className: '.' + tag + '-pop_size', label: 'pop size:',
                             step: 10, min: 10, value: 50, max: 300})
  let pop_size
  pop_size_c.value.subscribe(v => pop_size = v)
  
  const num_cycles_c = Slider({DOM: sources.DOM},
                              {className: '.' + tag + '-num_cycles', label: 'cycles:',
                               step: 10, min: 10, value: 20, max: 200})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider({DOM: sources.DOM},
                               {className: '.' + tag + '-num_markers', label: 'markers:',
                                step: 1, min: 1, value: 4, max: 20})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const exphe_plot = Plot(
    {id: tag + '-exphe', y_label: 'Expected Heterozygosity'},
    {DOM: sources.DOM, vals: exphe$})

  const numal_plot = Plot(
    {id: tag + '-numal', y_label: 'Number of distinct alleles'},
    {DOM: sources.DOM, vals: numal$})

  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

  simulate$.subscribe((x) => console.log(2123, x))
  
  const metis$ = simulate$.map(_ => {
    return Rx.Observable.from([
      {num_cycles, state: prepare_sim_state(tag, pop_size, num_markers, freq_start)}
    ])
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
                    freq_start_c.DOM, pop_size_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
                    exphe_plot.DOM, numal_plot.DOM)
                  .map(([freq_start, pop_size, num_cycles, num_markers,
                         exphe, numal]) =>
                    <div>
                      <div>
                        {freq_start}
                        {pop_size}
                        {num_cycles}
                        {num_markers}
                        <br/>
                        <button id={tag} value="1">Simulate</button>
                      </div>
                      {exphe}
                      {numal}
                    </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
