import Rx from 'rxjs/Rx'
import {nav} from '@cycle/dom'

import {makeMetisDriver} from './metis_driver'

import {WFApp} from './wright-fisher'
import {SimpleApp} from './simple'
import {SimpleFreqApp} from './simple-freq'
import {StochasticityApp} from './stochasticity'
import {DeclineApp} from './decline'
import {SelectionAppFactory} from './selection'
import {IslandApp} from './island'
import {SteppingStoneApp} from './stepping-stone'
import {SexRatioApp} from './sex-ratio'
import {AlphaApp} from './alpha'
import {SelectionDriftApp} from './selection-drift'


const load_url = (url, cb) => {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      cb(this)
    }
  }
  xhttp.open('GET', url, true)
  xhttp.send()
}

const load_url_obs = Rx.Observable.bindCallback(load_url)

const uikit_template$ = load_url_obs('/menu.html')

const main_template$ = load_url_obs('/main.html')


uikit_template$.subscribe(x => console.log(111, x))

export const App = (sources) => {
  const main_page$ = sources.DOM.select('#main').events('click')
                            .startWith({timeStamp: -1,
                                        srcElement: {id: 'main'}})

  const single_menu$ = sources.DOM.select('#menu-single').events('click')
                              .startWith({timeStamp: -1,
                                          srcElement: {id: 'menu-single'}})

  const wf_menu$ = sources.DOM.select('#menu-wf').events('click')
                          .startWith({timeStamp: -1,
                                      srcElement: {id: 'menu-wf'}})

  
  const freq_menu$ = sources.DOM.select('#menu-freq').events('click')
                            .startWith({timeStamp: -1,
                                        srcElement: {id: 'menu-freq'}})

  const stoch_menu$ = sources.DOM.select('#menu-stoch').events('click')
                             .startWith({timeStamp: -1,
                                         srcElement: {id: 'menu-stoch'}})

  const decline_menu$ = sources.DOM.select('#menu-decline').events('click')
                               .startWith({timeStamp: -1,
                                           srcElement: {id: 'menu-decline'}})
  
  const dominant_menu$ = sources.DOM.select('#menu-dominant').events('click')
                                .startWith({timeStamp: -1,
                                            srcElement: {id: 'menu-dominant'}})

  const recessive_menu$ = sources.DOM.select('#menu-recessive').events('click')
                                 .startWith({timeStamp: -1,
                                             srcElement: {id: 'menu-recessive'}})

  const hz_menu$ = sources.DOM.select('#menu-hz').events('click')
                          .startWith({timeStamp: -1,
                                      srcElement: {id: 'menu-hz'}})

  const island_menu$ = sources.DOM.select('#menu-island').events('click')
                              .startWith({timeStamp: -1,
                                          srcElement: {id: 'menu-island'}})

  const stoned_menu$ = sources.DOM.select('#menu-stoned').events('click')
                              .startWith({timeStamp: -1,
                                          srcElement: {id: 'menu-stoned'}})
  
  const sex_ratio_menu$ = sources.DOM.select('#menu-sex-ratio').events('click')
                                 .startWith({timeStamp: -1,
                                             srcElement: {id: 'menu-sex-ratio'}})

  const alpha_menu$ = sources.DOM.select('#menu-alpha').events('click')
                                 .startWith({timeStamp: -1,
                                             srcElement: {id: 'menu-alpha'}})
  
  const sel_drift_menu$ = sources.DOM.select('#menu-sel-drift').events('click')
                                 .startWith({timeStamp: -1,
                                             srcElement: {id: 'menu-sel-drift'}})
  
  
  const recent_event$ = Rx.Observable.combineLatest(
    main_page$,
    single_menu$, wf_menu$, freq_menu$, stoch_menu$,
    decline_menu$,
    dominant_menu$, recessive_menu$, hz_menu$,
    island_menu$, stoned_menu$,
    sex_ratio_menu$, alpha_menu$,
    sel_drift_menu$)
                          .map(entries => {
                            var ts = -10
                            var id = ""
                            for (var entry of entries) {
                              if (entry.timeStamp > ts) {
                                ts = entry.timeStamp
                                id = entry.srcElement.id
                              }
                            }
                            console.log(id)
                            return id
                          })

  const single_pop = SimpleApp({DOM: sources.DOM, metis: sources.metis})
  const sp_dom$ = single_pop.DOM
  const wf_pop = WFApp({DOM: sources.DOM, metis: sources.metis})
  const wf_dom$ = wf_pop.DOM
  const freq_pop = SimpleFreqApp({DOM: sources.DOM, metis: sources.metis})
  const fq_dom$ = freq_pop.DOM
  const stoch_pop = StochasticityApp({DOM: sources.DOM, metis: sources.metis})
  const sch_dom$ = stoch_pop.DOM
  const decline_pop = DeclineApp({DOM: sources.DOM, metis: sources.metis})
  const dc_dom$ = decline_pop.DOM

  const dominant_pop = SelectionAppFactory('dominant')({
    DOM: sources.DOM, metis: sources.metis})
  const dom_dom$ = dominant_pop.DOM
  const recessive_pop = SelectionAppFactory('recessive')({
    DOM: sources.DOM, metis: sources.metis})
  const rec_dom$ = recessive_pop.DOM
  const hz_pop = SelectionAppFactory('hz')({
    DOM: sources.DOM, metis: sources.metis})
  const hz_dom$ = hz_pop.DOM

  const island_pop = IslandApp({DOM: sources.DOM, metis: sources.metis})
  const il_dom$ = island_pop.DOM

  const stoned_pop = SteppingStoneApp({DOM: sources.DOM, metis: sources.metis})
  const sst_dom$ = stoned_pop.DOM

  const sex_ratio_pop = SexRatioApp({DOM: sources.DOM, metis: sources.metis})
  const sr_dom$ = sex_ratio_pop.DOM

  const alpha_pop = AlphaApp({DOM: sources.DOM, metis: sources.metis})
  const ap_dom$ = alpha_pop.DOM
  
  const sel_drift_pop = SelectionDriftApp({DOM: sources.DOM, metis: sources.metis})
  const sd_dom$ = sel_drift_pop.DOM

  
  const vdom$ = Rx
    .Observable.combineLatest(
      recent_event$, uikit_template$, main_template$,
      sp_dom$, wf_dom$, fq_dom$, sch_dom$,
      dc_dom$,
      dom_dom$, rec_dom$, hz_dom$,
      il_dom$, sst_dom$,
      sr_dom$, ap_dom$,
      sd_dom$)
    .map(arr => {
      const event = arr[0]
      const menu = arr[1].responseText
      const main = arr[2].responseText
      arr = arr.slice(3)
      return <div>
        <div innerHTML={menu}/>
	<div style={event === 'main' ? 'display: block' : 'display: none'}
	     innerHTML={main}/>

        <div style={event === 'menu-single' ? 'display: block' : 'display: none'}>
          {arr[0]}
        </div>
        <div style={event === 'menu-wf' ? 'display: block' : 'display: none'}>
          {arr[1]}
        </div>
        <div style={event === 'menu-freq' ? 'display: block' : 'display: none'}>
          {arr[2]}
        </div>
        <div style={event === 'menu-stoch' ? 'display: block' : 'display: none'}>
          {arr[3]}
        </div>
        <div style={event === 'menu-decline' ? 'display: block' : 'display: none'}>
          {arr[4]}
        </div>
        <div style={event === 'menu-dominant' ? 'display: block' : 'display: none'}>
          {arr[5]}
        </div>
        <div style={event === 'menu-recessive' ? 'display: block' : 'display: none'}>
          {arr[6]}
        </div>
        <div style={event === 'menu-hz' ? 'display: block' : 'display: none'}>
          {arr[7]}
        </div>
        <div style={event === 'menu-island' ? 'display: block' : 'display: none'}>
          {arr[8]}
        </div>
        <div style={event === 'menu-stoned' ? 'display: block' : 'display: none'}>
          {arr[9]}
        </div>
        <div style={event === 'menu-sex-ratio' ? 'display: block' : 'display: none'}>
          {arr[10]}
        </div>
        <div style={event === 'menu-alpha' ? 'display: block' : 'display: none'}>
          {arr[11]}
        </div>
        <div style={event === 'menu-sel-drift' ? 'display: block' : 'display: none'}>
          {arr[12]}
        </div>
	<div>
	  <p><small>This is metis-web.
	  A population genetics' learning tool on the web.
	    <a href="mailto:tiagoantao@gmail.com">Contact us</a></small> </p>
	</div>
	<div style="width: 50%; margin-left: auto"><img src="umt.jpg"/></div>
      </div>
    })

  const sinks = {
    DOM: vdom$,
    metis: Rx.Observable.merge(
      wf_pop.metis, single_pop.metis, freq_pop.metis, stoch_pop.metis,
      decline_pop.metis, 
      dominant_pop.metis, recessive_pop.metis, hz_pop.metis,
      island_pop.metis, stoned_pop.metis,
      sex_ratio_pop.metis, alpha_pop.metis,
      sel_drift_pop.metis)
    
  }
  
  return sinks
}
