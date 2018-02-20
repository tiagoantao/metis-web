import Rx from 'rxjs/Rx'

import {Plot} from './plot.js'
import {Selector} from './selector.js'
import {Slider} from './slider.js'
import {Table} from './table.js'


import {
  gn_generate_unlinked_genome,
  gn_MicroSatellite,
  gn_SNP,
  i_assign_random_sex,
  integrated_create_randomized_genome,
  integrated_generate_individual_with_genome,
  ops_BaseOperator,
  ops_culling_KillOlderGenerations,
  ops_rep_SexualReproduction,
  ops_RxOperator,  // Currently not in use
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_NumAl,
  ops_wrap_list,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


class SizeChange {  //XXX Very ugly hack
  constructor(decline_cycle, end_pop_size) {
    this._decline_cycle = decline_cycle
    this._end_pop_size = end_pop_size
  }
  
  change(state) {
    if (state.cycle === this._decline_cycle) {
      state.operators[0]._size = this._end_pop_size
    }
  }
}


const prepare_sim_state = (tag, start_pop_size, end_pop_size,
                           decline_cycle, num_markers, marker_type) => {
                             const genome_size = num_markers

                             console.log(marker_type)
  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return marker_type === 'SNP'? new gn_SNP() : new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, start_pop_size),
    new ops_culling_KillOlderGenerations(),
    new SizeChange(decline_cycle, end_pop_size),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_NumAl(),
    new ops_stats_hz_ExpHe()
  ])
  const individuals = p_generate_n_inds(start_pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0, integrated_create_randomized_genome)))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const DeclineApp = (sources) => {

  const tag = 'decline'

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


  const marker_type_c = Selector({DOM: sources.DOM},
                                 {className: '.' + tag + '-marker_type',
                                  label: 'Marker type'})
  let marker_type
  marker_type_c.value.subscribe(v => marker_type = v)
  
  const start_pop_size_c = Slider({DOM: sources.DOM},
                                  {className: '.' + tag + '-start_pop_size', label: 'Starting population size',
                                   step: 10, min: 10, value: 200, max: 300})
  let start_pop_size
  start_pop_size_c.value.subscribe(v => start_pop_size = v)

  const end_pop_size_c = Slider({DOM: sources.DOM},
                                {className: '.' + tag + '-end_pop_size', label: 'Size after decline',
                                 step: 10, min: 10, value: 30, max: 300})
  let end_pop_size
  end_pop_size_c.value.subscribe(v => end_pop_size = v)

  const decline_cycle_c = Slider({DOM: sources.DOM},
                                 {className: '.' + tag + '-decline_cycle', label: 'Decline cycle',
                                  step: 10, min: 10, value: 100, max: 200})
  let decline_cycle
  decline_cycle_c.value.subscribe(v => decline_cycle = v)

  
  const num_cycles_c = Slider({DOM: sources.DOM},
                              {className: '.' + tag + '-num_cycles', label: 'Cycles',
                               step: 10, min: 10, value: 200, max: 500})
  let num_cycles
  num_cycles_c.value.subscribe(v => num_cycles = v)

  const num_markers_c = Slider({DOM: sources.DOM},
                               {className: '.' + tag + '-num_markers', label: 'Number of markers',
                                step: 1, min: 1, value: 4, max: 20})
  let num_markers
  num_markers_c.value.subscribe(v => num_markers = v)

  const exphe_clean$ = exphe$.map(arr => arr.map(v => {
    return {marker: v.marker, exp_he: Math.round(v.y * 100) / 100}}))

  const exphe_table = Table(
    {DOM: sources.DOM,
     data: exphe_clean$.startWith([])},
    {fields: ['marker', 'exp_he'],
     headers: ['Marker', 'Expected Hz']}
  )

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
    const init = {
      num_cycles,
      state: prepare_sim_state(tag, start_pop_size, end_pop_size,
                               decline_cycle, num_markers, marker_type)
    }
    return init
  })

  const vdom$ = Rx.Observable.combineLatest(
    marker_type_c.DOM, start_pop_size_c.DOM,
    end_pop_size_c.DOM, decline_cycle_c.DOM,
    num_cycles_c.DOM, num_markers_c.DOM,
    exphe_table.DOM,
    exphe_plot.DOM, numal_plot.DOM)
        .map(([marker_type, start_pop_size, end_pop_size, decline_cycle,
               num_cycles, num_markers,
               exphe_table,
               exphe, numal]) =>
                    <div>
                      <div>
                        {marker_type}
                        {start_pop_size}
                        {end_pop_size}
                        {decline_cycle}
                        {num_cycles}
                        {num_markers}
                        <br/>
                        <button id={tag} value="1">Simulate</button>
                      </div>
                      <h2>Expected Heterozygosity</h2>
                      {exphe_table}
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
