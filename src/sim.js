import {
    gn_generate_unlinked_genome,
    gn_MicroSatellite,
    gn_SNP,
    i_assign_random_sex,
    integrated_create_randomized_genome,
    integrated_generate_individual_with_genome,
    p_generate_n_inds,
    sp_Species
} from '@tiagoantao/metis-sim'


export const create_unlinked_species = (num_markers, marker_type) => {
    const genome_size = num_markers

    const unlinked_genome = gn_generate_unlinked_genome(
      genome_size, () => {
        return marker_type === 'SNP'?
               new gn_SNP() :
               new gn_MicroSatellite(Array.from(new Array(10), (x,i) => i))
      })
    return new sp_Species('unlinked', unlinked_genome)
}


export const create_sex_population = (species, num_individuals) => {
    return p_generate_n_inds(
        num_individuals, () =>
            i_assign_random_sex(integrated_generate_individual_with_genome(
                species, 0, integrated_create_randomized_genome)))
}
