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
  ops_rep_AutosomeSNPMater,
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_NumAl,
  ops_wrap_list,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, freq_start,
  sel, marker_name, feature_position) => {
  const genome_size = num_markers

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return new gn_SNP()})
  const species = new sp_Species('unlinked', unlinked_genome)
  const mater_factory = (reproductor, individuals) =>
    new ops_rep_AutosomeSNPMater(
      reproductor, individuals,
      sel, marker_name, feature_position)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, pop_size, [], mater_factory),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_NumAl(),
    new ops_stats_hz_ExpHe()
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


export const SelectionAppFactory = (sel_type) => (sources) => {
  const tag = 'selection' + sel_type

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const numal$ = my_metis$.map(state => {
    var cnt = 0
    return state.global_parameters.NumAl.unlinked.map(numal => {
      return {
        x: state.cycle - 1, y: numal, marker: 'M' + cnt++}})
  })

  const s_c = Slider({DOM: sources.DOM},
                     {className: '.' + tag + '-s', label: 's (%):',
                      step: 1, min: 0, value: 10, max: 20,
                      print: (x) => x / 100})
  let s
  s_c.value.subscribe(v => s = v / 100)
  
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
  
  const metis$ = simulate$.map(_ => {
    let sel = null
    switch (sel_type) {
      case 'dominant':
        sel = {0: 1 - s, 1: 1, 2: 1}
        break
      case 'recessive':
        sel = {0: 1 - s, 1: 1 - s, 2: 1}
        break
      case 'hz':
        sel = {0: 1 - s, 1: 1, 2: 1 - s}
        break
    }
    return Rx.Observable.from([
          {num_cycles, state: prepare_sim_state
            (tag, pop_size, num_markers, freq_start,
             sel, 'unlinked', 0)}
    ])
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
                    s_c.DOM,
                    freq_start_c.DOM, pop_size_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
                    exphe_plot.DOM, numal_plot.DOM)
                  .map(([s, freq_start, pop_size, num_cycles, num_markers,
                         exphe, numal]) =>
                           <div>
                             <h1>Selection {sel_type}</h1>
                             <div>
                               {s}
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
