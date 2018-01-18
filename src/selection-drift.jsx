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
  ops_stats_demo_SexStatistics,
  ops_stats_hz_ExpHe,
  ops_stats_FreqAl,
  ops_stats_TimeFix,
  ops_stats_NumAl,
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
    const operators = [
      new ops_rep_SexualReproduction(species, pop_size, [], mater_factory),
      new ops_culling_KillOlderGenerations(),
      new ops_stats_demo_SexStatistics(),
      new ops_stats_NumAl(),
      new ops_stats_FreqAl(),
      new ops_stats_TimeFix(),
      new ops_stats_hz_ExpHe()
  ]
  const individuals = p_generate_n_inds(pop_size, () =>
    i_assign_random_sex(integrated_generate_individual_with_genome(
      species, 0,
      (ind) => integrated_create_freq_genome(freq_start / 100, ind))))
  const state = {
    global_parameters: {tag, stop: false},
    individuals, operators, cycle: 1}
  return state
}


export const SelectionDriftApp = (sources) => {
  const tag = 'sel-drift'
  const tag1 = 'sel-drift1'
  const tag2 = 'sel-drift2'

  const my_metis1$ = sources.metis.filter(
    state => state.global_parameters.tag === tag1)

  const my_metis2$ = sources.metis.filter(
    state => state.global_parameters.tag === tag2)
  
  const freqal1$ = my_metis1$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
  })

  const freqal2$ = my_metis2$.map(state => {
    var cnt = 1
    return state.global_parameters.FreqAl.unlinked.map(freqal => {
      return {
        x: state.cycle, y: freqal, marker: 'M' + cnt++}})
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
  
  const pop_size1_c = Slider({DOM: sources.DOM},
                             {className: '.' + tag + '-pop_size1', label: 'pop size1:',
                              step: 10, min: 10, value: 50, max: 300})
  let pop_size1
  pop_size1_c.value.subscribe(v => pop_size1 = v)


  const pop_size2_c = Slider({DOM: sources.DOM},
                             {className: '.' + tag + '-pop_size2', label: 'pop size2:',
                              step: 10, min: 10, value: 300, max: 300})
  let pop_size2
  pop_size2_c.value.subscribe(v => pop_size2 = v)

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

  const freqal1_plot = Plot(
    {id: tag + '-freqal1', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: freqal1$})

  const freqal2_plot = Plot(
    {id: tag + '-freqal2', y_label: 'Frequency of Derived Allele'},
    {DOM: sources.DOM, vals: freqal2$})
  
  const simulate$ = sources.DOM.select('#' + tag)
                           .events('click')
                           .map(ev => parseInt(ev.target.value))

  simulate$.subscribe((x) => console.log(2123, x))
  
  const metis1$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1, 2: 1}
    return Rx.Observable.from([
      {num_cycles, state: prepare_sim_state(tag1, pop_size1, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    ])
  })

  const metis2$ = simulate$.map(_ => {
    const sel = {0: 1 - s, 1: 1, 2: 1}
    return Rx.Observable.from([
      {num_cycles, state: prepare_sim_state(tag2, pop_size2, num_markers, 100 - freq_start, sel, 'unlinked', 0)}
    ])
  })
  
  const vdom$ = Rx.Observable
                  .combineLatest(
		    s_c.DOM,
                    freq_start_c.DOM,
		    pop_size1_c.DOM, pop_size2_c.DOM,
                    num_cycles_c.DOM, num_markers_c.DOM,
		    freqal1_plot.DOM, freqal2_plot.DOM
                  )
                  .map(([s,
			 freq_start,
			 pop_size1, pop_size2,
			 num_cycles, num_markers,
			 freqal1, freqal2]) =>
                      <div>
			<div>
			  {s}
                          {freq_start}
                          {num_cycles}
                          {num_markers}
                          <br/>
                          <button id={tag} value="1">Simulate</button>
			</div>
			<table>
			  <tr>
			    <td>{pop_size1}{freqal1}</td>
			    <td>{pop_size2}{freqal2}</td>
			  </tr>
			</table>
                      </div>
                  )

  const sinks = {
    DOM: vdom$,
    metis: Rx.Observable.merge(metis1$, metis2$)
  }
  
  return sinks
}
