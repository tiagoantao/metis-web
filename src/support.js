import {Species} from '@tiagoantao/metis/lib/metis/species'
import {assign_random_sex} from '@tiagoantao/metis/lib/metis/individual'
import {generate_n_inds} from '@tiagoantao/metis/lib/metis/population'
import {generate_individual_with_genome, create_randomized_genome} from '@tiagoantao/metis/lib/metis/integrated'
import * as genotype from '@tiagoantao/metis/lib/metis/genotype'

import * as reproduction from '@tiagoantao/metis/lib/metis/operators/reproduction'

import {KillOlderGenerations} from '@tiagoantao/metis/lib/metis/operators/culling'
import {ExpHe} from '@tiagoantao/metis/lib/metis/operators/stats/hz'
import {SexStatistics} from '@tiagoantao/metis/lib/metis/operators/stats/demo'

import {RxOperator} from '@tiagoantao/metis/lib/metis/operator'

import {do_n_cycles} from '@tiagoantao/metis/lib/metis/simulator'


export let simulate = (observer, pop_size=50, genome_size=10, cycles=50) => {
    let unlinked_genome = genotype.generate_unlinked_genome(genome_size,
        () => {return new genotype.SNP()})
    const species = new Species('unlinked', unlinked_genome)

    let individuals = generate_n_inds(pop_size, () =>
        assign_random_sex(generate_individual_with_genome(species, 0, create_randomized_genome)))

    let observable = new RxOperator()
    observable.subscribe(observer)

    let operators = [
        new reproduction.SexualReproduction(species, pop_size),
        new KillOlderGenerations(),
        new SexStatistics(),
        new ExpHe(),
        observable]
    do_n_cycles(cycles, individuals, operators)
}


let values = []
let cycle = 1
let genome_size = 5
let record_stats = (stats) => {
    let exp_he = stats.ExpHe
    for (let i=0; i<genome_size; i++) {
        values.push({cycle, ExpHe: exp_he.unlinked[i], marker: 'M' + i})
    }
    cycle++
}
simulate(record_stats, 100, genome_size)

let spec = `
{
  "description": "ExpHe over cycles",
  "data": {
    "values": [
      {"a": "A","b": 28}, {"a": "B","b": 55}, {"a": "C","b": 43},
      {"a": "D","b": 91}, {"a": "E","b": 81}, {"a": "F","b": 53},
      {"a": "G","b": 19}, {"a": "H","b": 87}, {"a": "I","b": 52}
    ]
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "cycle", "type": "quantitative"},
    "y": {"field": "ExpHe", "type": "quantitative"},
    "color": {"field": "marker", "type": "nominal"}
  }
}`
let jspec = JSON.parse(spec)
jspec.data.values = values
let embedSpec = {
    mode: "vega-lite",
    spec: jspec
}
vg.embed("#vis", embedSpec, function(error, result) {

})
