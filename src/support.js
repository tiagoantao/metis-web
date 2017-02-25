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


export let simulate = (observer, pop_size, genome_size, cycles) => {
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


export * from './web_support.js'