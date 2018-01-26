import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'


import {
  gn_generate_unlinked_genome,
  gn_MicroSatellite,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_randomized_genome,
  integrated_generate_individual_with_genome,
  ops_culling_KillOlderGenerations,
  ops_p_MigrationIslandFixed,
  ops_rep_StructuredSexualReproduction,
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_hz_ExpHeDeme,
  ops_stats_NumAl,
  ops_wrap_list,
  p_assign_fixed_size_population,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, num_demes, deme_size, num_migs,
                           num_markers, marker_type) => {
  const genome_size = num_markers

  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {
      return marker_type === 'SNP'?
        new gn_SNP() :
        new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))
      })
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_StructuredSexualReproduction(species, deme_size, num_demes),
    new ops_culling_KillOlderGenerations(),
    new ops_p_MigrationIslandFixed(num_migs),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_hz_ExpHe(),
    new ops_stats_hz_ExpHeDeme()
  ])
  const individuals = p_generate_n_inds(deme_size * num_demes, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0, integrated_create_randomized_genome)))
  p_assign_fixed_size_population(individuals, num_demes)
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const IslandApp = (sources) => {

  const tag = 'island'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const dexphe$ = my_metis$.map(state => {
    var cnt = 1
      console.log(state.global_parameters)
    return state.global_parameters.DemeExpHe[0].unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })
    
  const marker_type_c = Selector({DOM: sources.DOM},
                                 {className: '.' + tag + '-marker_type',
                                  label: 'marker type:'})
  let marker_type
  marker_type_c.value.subscribe(v => marker_type = v)
  
  const deme_size_c = Slider({DOM: sources.DOM},
                             {className: '.' + tag + '-deme_size', label: 'deme size:',
                              step: 10, min: 10, value: 50, max: 100})
  let deme_size
  deme_size_c.value.subscribe(v => deme_size = v)


  const num_demes_c = Slider({DOM: sources.DOM},
                             {className: '.' + tag + '-num_demes', label: 'num demes:',
                              step: 1, min: 2, value: 2, max: 10})
  let num_demes
  num_demes_c.value.subscribe(v => num_demes = v)

  const num_migs_c = Slider({DOM: sources.DOM},
                            {className: '.' + tag + '-num_migs', label: 'num migrants:',
                             step: 1, min: 0, value: 1, max: 9})
  let num_migs
  num_migs_c.value.subscribe(v => num_migs = v)
  
  
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
    {id: tag + '-exphe', y_label: 'Expected Hz - Meta population'},
    {DOM: sources.DOM, vals: exphe$})

  const dexphe_plot = Plot(
    {id: tag + '-dexphe', y_label: 'Expected Hz - A Deme'},
    {DOM: sources.DOM, vals: dexphe$})

  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))
  
  const metis$ = simulate$.map(_ => {
    const init = {
      num_cycles,
      state: prepare_sim_state(tag, num_demes, deme_size, num_migs,
                               num_markers, marker_type)
    }
    return init
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
                    marker_type_c.DOM,
                    deme_size_c.DOM, num_demes_c.DOM, num_migs_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
                    exphe_plot.DOM, dexphe_plot.DOM)
                  .map(([marker_type,
                         num_demes, deme_size, num_migs,
                         num_cycles, num_markers,
                         exphe, dexphe]) =>
                           <div>
                             <div>
                               {marker_type}
                               {num_demes}
                               {num_migs}
                               {deme_size}
                               {num_cycles}
                               {num_markers}
                               <br/>
                               <button id={tag} value="1">Simulate</button>
                             </div>
                             {exphe}
                             {dexphe}
                           </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
