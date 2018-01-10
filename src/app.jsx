import Rx from 'rxjs/Rx'
import {nav} from '@cycle/dom'

import {makeMetisDriver} from './metis_driver'

import {WFApp} from './wright-fisher'
import {SimpleApp} from './simple'
import {SimpleFreqApp} from './simple-freq'
import {DeclineApp} from './decline'
import {SelectionAppFactory} from './selection'

const uikit_template =
  nav({attrs:{className:"uk-navbar-container", "uk-navbar": 1}},
      <div className="uk-navbar-left">

        <ul className="uk-navbar-nav">
          <li className="uk-active"><a href="index.html">Metis</a></li>
          <li><a href="#">Simple</a>
	    <div className="uk-navbar-dropdown">
	      <ul className="uk-nav uk-navbar-dropdown-nav">
		<li><a href="#" id="menu-wf">Wright-Fisher</a></li>
                <li><a href="#" id="menu-single">Wright-Fisher with sex</a></li>
                <li><a href="#" id="menu-freq">Initial Frequency</a></li>
	      </ul>
            </div>
	  </li>
	  <li><a href="#">Fluctuations</a>
	    <div className="uk-navbar-dropdown">
	      <ul className="uk-nav uk-navbar-dropdown-nav">
		<li><a href="#" id="menu-decline">Decline</a></li>
	      </ul>
	    </div>
	  </li>
	  <li><a href="#">Selection</a>
	    <div className="uk-navbar-dropdown">
	      <ul className="uk-nav uk-navbar-dropdown-nav">
		<li><a href="#" id="menu-dominant">Dominant</a></li>
		<li><a href="#" id="menu-recessive">Recessive</a></li>
		<li><a href="#" id="menu-dominant">Hz advantage</a></li>
	      </ul>
	    </div>
	  </li>
	  <li><a href="#">Structure</a>
	    <div className="uk-navbar-dropdown">
	      <ul className="uk-nav uk-navbar-dropdown-nav">
		<li><a href="#">Island</a></li>
		<li><a href="#">Stepping-stone 1D</a></li>
		<li><a href="#">Stepping-stone 2D</a></li>
	      </ul>
	    </div>
	  </li>

        </ul>

      </div>
  )


export const App = (sources) => {
  const single_menu$ = sources.DOM.select('#menu-single').events('click')
                              .startWith({timeStamp: -1,
					  srcElement: {id: 'menu-single'}})

  const wf_menu$ = sources.DOM.select('#menu-wf').events('click')
                          .startWith({timeStamp: -1,
	                               srcElement: {id: 'menu-wf'}})

  
  const freq_menu$ = sources.DOM.select('#menu-freq').events('click')
                            .startWith({timeStamp: -1,
					srcElement: {id: 'menu-freq'}})

  const decline_menu$ = sources.DOM.select('#menu-decline').events('click')
                               .startWith({timeStamp: -1,
			                   srcElement: {id: 'menu-decline'}})
  
  const selection_menu$ = sources.DOM.select('#menu-dominant').events('click')
			         .startWith({timeStamp: -1,
					     srcElement: {id: 'menu-dominant'}})

  const recent_event$ = Rx.Observable.combineLatest(
    single_menu$, wf_menu$, freq_menu$, decline_menu$, selection_menu$)
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
  const decline_pop = DeclineApp({DOM: sources.DOM, metis: sources.metis})
  const dc_dom$ = decline_pop.DOM
  const selection_pop = SelectionAppFactory('dominant')({DOM: sources.DOM, metis: sources.metis})
  const sel_dom$ = selection_pop.DOM

  const vdom$ = Rx
    .Observable.combineLatest(recent_event$, sp_dom$, wf_dom$, fq_dom$, dc_dom$, sel_dom$)
    .map(arr =>
      <div>
	{uikit_template}
        <div style={arr[0] === 'menu-single' ? 'display: block' : 'display: none'}>
	  {arr[1]}
        </div>
        <div style={arr[0] === 'menu-wf' ? 'display: block' : 'display: none'}>
	  {arr[2]}
        </div>
        <div style={arr[0] === 'menu-freq' ? 'display: block' : 'display: none'}>
	  {arr[3]}
        </div>
        <div style={arr[0] === 'menu-decline' ? 'display: block' : 'display: none'}>
	  {arr[4]}
	</div>
        <div style={arr[0] === 'menu-dominant' ? 'display: block' : 'display: none'}>
	  {arr[5]}
        </div>
      </div>
    )

  const sinks = {
    DOM: vdom$,
    metis: Rx.Observable.merge(selection_pop.metis, wf_pop.metis,
			       freq_pop.metis,
			       decline_pop.metis, single_pop.metis)
  }
  
  return sinks
}
