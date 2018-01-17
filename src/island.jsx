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
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_NumAl,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, marker_type) => {
  const genome_size = num_markers

  console.log(marker_type)
  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return marker_type === 'SNP'? new gn_SNP() : new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))})
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
      species, 0, integrated_create_randomized_genome)))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 0}
  return state
}


export const SimpleApp = (sources) => {

  const tag = 'island'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const numal$ = my_metis$.map(state => {
    var cnt = 0
    return state.global_parameters.NumAl.unlinked.map(numal => {
      return {
        x: state.cycle - 1, y: numal, marker: 'M' + cnt++}})
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

  const numal_plot = Plot(
    {id: tag + '-numal', y_label: 'Number of distinct alleles'},
    {DOM: sources.DOM, vals: numal$})

  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))
  
  const metis$ = simulate$.map(_ => {
    return Rx.Observable.from([
      {num_cycles, state: prepare_sim_state(tag, num_demes, deme_size,
					    num_markers, marker_type)}
    ])
  })

  const vdom$ = Rx.Observable
                  .combineLatest(
                    marker_type_c.DOM,
		    deme_size_c.DOM, num_demes_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
                    numal_plot.DOM)
                  .map(([marker_type, num_demes, deme_size, num_cycles, num_markers,
                         numal]) =>
			   <div>
			     <div>
                               {marker_type}
                               {num_demes}
			       {deme_size}
                               {num_cycles}
                               {num_markers}
                               <br/>
                               <button id={tag} value="1">Simulate</button>
			     </div>
			     {numal}
			   </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
