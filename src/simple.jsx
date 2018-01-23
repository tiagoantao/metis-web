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
  ops_stats_utils_SaveGenepop,
  ops_wrap_list,
  p_generate_n_inds,
  sp_Species} from '@tiagoantao/metis-sim'


const prepare_sim_state = (tag, pop_size, num_markers, marker_type) => {
  const genome_size = num_markers

  console.log(marker_type)
  const unlinked_genome = gn_generate_unlinked_genome(
    genome_size, () => {return marker_type === 'SNP'?
                               new gn_SNP() :
                               new gn_MicroSatellite(
                                 Array.from(new Array(10), (x,i) => i))})
  const species = new sp_Species('unlinked', unlinked_genome)
  const operators = ops_wrap_list([
    new ops_rep_SexualReproduction(species, pop_size),
    new ops_culling_KillOlderGenerations(),
    new ops_stats_demo_SexStatistics(),
    new ops_stats_NumAl(),
    new ops_stats_hz_ExpHe()
  ])
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0, integrated_create_randomized_genome)))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const SimpleApp = (sources) => {
  const tag = 'simple'

  const my_metis$ = sources.metis.filter(
    state => state.global_parameters.tag === tag)

  const exphe$ = my_metis$.map(state => {
    var cnt = 1
    return state.global_parameters.ExpHe.unlinked.map(exphe => {
      return {
        x: state.cycle - 1, y: exphe, marker: 'M' + cnt++}})
  })

  const sex_ratio$ = my_metis$.map(state => {
    const sr = state.global_parameters.SexRatio
    return [{x: state.cycle - 1, y: sr.males / sr.females, marker: 'Sex Ratio'}]
  })
  
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

  const sr_plot = Plot(
    {id: tag + '-sr', y_label: 'Sex Ratio'},
    {DOM: sources.DOM, vals: sex_ratio$})

  
  const numal_plot = Plot(
    {id: tag + '-numal', y_label: 'Number of distinct alleles'},
    {DOM: sources.DOM, vals: numal$})

  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

  const save$ = sources.DOM.select('#' + tag + '_save')
                           .events('click')
                           .map(ev => parseInt(ev.target.value))
  
  const metis$ = simulate$.map(_ => {
    return Rx.Observable.from([
      {num_cycles, state: prepare_sim_state(tag, pop_size, num_markers, marker_type)}
    ])
  })

  const save_gp$ = my_metis$.sample(save$)

  save_gp$.subscribe(state => {
    const op = new ops_stats_utils_SaveGenepop()
    op.change(state)
    console.log(state.global_parameters.SaveGenepop)
    const a = document.createElement('a')
    a.setAttribute('download', 'metis.txt')
    a.href = 'data:text/plain;charset=utf-8,'+ state.global_parameters.SaveGenepop
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  const vdom$ = Rx.Observable.combineLatest(
    marker_type_c.DOM, pop_size_c.DOM,
    num_cycles_c.DOM, num_markers_c.DOM,
    exphe_plot.DOM, sr_plot.DOM, numal_plot.DOM).map(
      ([marker_type, pop_size, num_cycles, num_markers,
        exphe, sex_ratio, numal]) =>
          <div>
            <div>
              {marker_type}
              {pop_size}
              {num_cycles}
              {num_markers}
              <br/>
              <button id={tag} value="1">Simulate</button>
            </div>
            {exphe}
            {sex_ratio}
            {numal}
            <br/>
            <button id={tag + '_save'} value="1">Save</button>
          </div>
    )

  const sinks = {
    DOM: vdom$,
    metis: metis$
  }
  
  return sinks
}
