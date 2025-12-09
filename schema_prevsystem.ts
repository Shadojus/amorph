/**
 * AMORPH Universal Fungi Schema v5.0
 * 
 * Complete Holistic Schema for ALL Fungi Species
 * With Comprehensive Source Citation System
 * 
 * Visualization-First Architecture:
 * Every field structure is designed for automatic pattern recognition by MorphMapper
 * Supporting 30+ visualization morphs with scientifically complete data
 *
 * Core Principles:
 * - Universal: Works for all 150,000+ known fungi species
 * - Complete: Incorporates all scientific dimensions
 * - Cited: Every data point traceable to sources
 * - Visual: Optimized for automatic visualization generation
 * - Interconnected: Rich relationships across all dimensions
 * - Temporal: Multi-scale from microseconds to millennia
 * - Molecular: From atoms to ecosystems
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * ============================================================================
 * SOURCE CITATION SYSTEM
 * ============================================================================
 */
const citationSource = v.object({
  id: v.string(), // unique identifier
  type: v.optional(v.string()), // human, digital, book, journal, database, observation, traditional, museum, herbarium
  
  // Human sources
  human: v.optional(v.object({
    name: v.optional(v.string()),
    credentials: v.optional(v.array(v.string())),
    affiliation: v.optional(v.string()),
    contact: v.optional(v.string()),
    expertise_areas: v.optional(v.array(v.string())),
    interview_date: v.optional(v.number()),
    location: v.optional(v.string()),
    verification_method: v.optional(v.string()),
  })),
  
  // Digital sources
  digital: v.optional(v.object({
    url: v.optional(v.string()),
    database_name: v.optional(v.string()),
    access_date: v.optional(v.number()),
    version: v.optional(v.string()),
    doi: v.optional(v.string()),
    reliability_score: v.optional(v.number()), // 0-100
    license: v.optional(v.string()),
  })),
  
  // Book sources
  book: v.optional(v.object({
    title: v.optional(v.string()),
    authors: v.optional(v.array(v.string())),
    isbn: v.optional(v.string()),
    publisher: v.optional(v.string()),
    year: v.optional(v.number()),
    edition: v.optional(v.string()),
    pages: v.optional(v.string()),
    chapter: v.optional(v.string()),
  })),
  
  // Journal sources
  journal: v.optional(v.object({
    title: v.optional(v.string()),
    authors: v.optional(v.array(v.string())),
    journal_name: v.optional(v.string()),
    volume: v.optional(v.number()),
    issue: v.optional(v.number()),
    pages: v.optional(v.string()),
    year: v.optional(v.number()),
    doi: v.optional(v.string()),
    pmid: v.optional(v.string()),
    impact_factor: v.optional(v.number()),
  })),
  
  // Traditional knowledge sources
  traditional: v.optional(v.object({
    culture: v.optional(v.string()),
    knowledge_keeper: v.optional(v.string()),
    community: v.optional(v.string()),
    transmission_method: v.optional(v.string()), // oral, written, demonstration
    documentation_date: v.optional(v.number()),
    permission_status: v.optional(v.string()),
    benefit_sharing_agreement: v.optional(v.string()),
  })),
  
  // Quality metrics
  quality: v.optional(v.object({
    confidence: v.optional(v.number()), // 0-100
    peer_reviewed: v.optional(v.boolean()),
    reproducible: v.optional(v.boolean()),
    consensus_level: v.optional(v.string()), // high, medium, low, disputed
    last_verified: v.optional(v.number()),
  })),
});

// Wrapper for any field that needs citation
const citedValue = (valueType: any) => v.object({
  value: v.optional(valueType),
  sources: v.optional(v.array(citationSource)),
  confidence: v.optional(v.number()), // 0-100
  consensus: v.optional(v.string()), // unanimous, majority, disputed, minority
  last_updated: v.optional(v.number()),
});

/**
 * ============================================================================
 * MASTER FUNGI TABLE - Universal & Complete
 * ============================================================================
 */
const fungi = defineTable({
  // ===== CORE IDENTITY =====
  commonName: citedValue(v.string()),
  latinName: citedValue(v.string()),
  scientificNameSynonyms: citedValue(v.array(v.string())),
  commonNameVariants: citedValue(v.array(v.string())),
  seoName: v.string(),
  slug: v.string(),
  
  // Multi-language names with etymology
  internationalNames: v.optional(citedValue(v.array(v.object({
    language: v.string(),
    name: v.string(),
    script: v.optional(v.string()),
    meaning: v.optional(v.string()),
    etymology: v.optional(v.string()),
    first_recorded_use: v.optional(v.number()),
  })))),
  
  // Naming history
  nomenclatureHistory: v.optional(citedValue(v.array(v.object({
    name: v.string(),
    author: v.string(),
    year: v.number(),
    type: v.string(), // basionym, synonym, combination
    validity: v.string(), // valid, invalid, disputed
    reference: citationSource,
  })))),
  
  // ===== VISUAL IDENTITY (Enhanced with 360° and microscopy) =====
  visualIdentity: v.optional(v.object({
    // High-resolution imagery
    primaryImage: citedValue(v.string()),
    
    imageGallery: v.optional(citedValue(v.array(v.object({
      url: v.string(),
      type: v.string(), // photograph, illustration, microscopy, SEM, diagram, 3D
      viewAngle: v.string(),
      magnification: v.optional(v.number()),
      developmentStage: v.string(),
      season: v.optional(v.string()),
      habitat_shown: v.optional(v.string()),
      photographer: v.string(),
      date_taken: v.number(),
      location: v.optional(v.object({
        lat: v.number(),
        lon: v.number(),
        place_name: v.string(),
      })),
      equipment: v.optional(v.string()),
      license: v.string(),
      color_accuracy: v.optional(v.string()), // calibrated, natural, enhanced
    })))),
    
    // 360° visualization data
    view360: v.optional(citedValue(v.optional(v.object({
      frames: v.array(v.string()),
      frameCount: v.number(),
      rotationAxis: v.string(),
      capture_method: v.string(), // photogrammetry, turntable, synthetic
      model_url: v.optional(v.string()), // 3D model file
      texture_resolution: v.optional(v.number()),
    })))),
    
    // Scientific color data
    colorData: v.optional(citedValue(v.object({
      // Standardized color measurements
      munsell_colors: v.optional(v.array(v.object({
        location: v.string(), // cap, stem, gills, flesh, spores
        fresh: v.string(), // Munsell notation
        dry: v.optional(v.string()),
        age_changes: v.optional(v.array(v.object({
          stage: v.string(),
          color: v.string(),
        }))),
      }))),
      
      // Digital color palette
      rgb_palette: v.array(v.object({
        location: v.string(),
        hex: v.string(),
        rgb: v.object({ r: v.number(), g: v.number(), b: v.number() }),
        lab: v.object({ l: v.number(), a: v.number(), b: v.number() }),
        dominance: v.number(), // 0-100%
        variability: v.number(), // 0-100%
      })),
      
      // Color chemistry
      pigments: v.optional(v.array(v.object({
        compound: v.string(),
        color_produced: v.string(),
        location: v.array(v.string()),
        pH_sensitive: v.boolean(),
        light_sensitive: v.boolean(),
      }))),
      
      // Staining reactions
      chemical_reactions: v.optional(v.array(v.object({
        reagent: v.string(), // KOH, NH4OH, FeSO4, Melzer's
        location: v.string(),
        color_change: v.string(),
        diagnostic_value: v.string(), // high, medium, low
      }))),
    }))),
    
    // Visual signature for AI/ML
    visualSignature: citedValue(v.object({
      shape_vector: v.array(v.number()), // 128-dim shape embedding
      texture_vector: v.array(v.number()), // 128-dim texture embedding
      color_vector: v.array(v.number()), // 128-dim color embedding
      pattern_vector: v.array(v.number()), // 128-dim pattern embedding
      uniqueness_score: v.number(), // 0-100
      confusion_species: v.optional(v.array(v.string())), // easily confused with
    })),
  })),
  
  // ===== TAXONOMY & PHYLOGENY (Complete hierarchical data) =====
  taxonomy: v.optional(citedValue(v.object({
    // Standard ranks
    domain: v.string(), // Eukaryota
    kingdom: v.string(), // Fungi
    subkingdom: v.optional(v.string()),
    phylum: v.string(),
    subphylum: v.optional(v.string()),
    class: v.string(),
    subclass: v.optional(v.string()),
    order: v.string(),
    suborder: v.optional(v.string()),
    family: v.string(),
    subfamily: v.optional(v.string()),
    tribe: v.optional(v.string()),
    genus: v.string(),
    subgenus: v.optional(v.string()),
    section: v.optional(v.string()),
    species: v.string(),
    subspecies: v.optional(v.string()),
    variety: v.optional(v.string()),
    forma: v.optional(v.string()),
    
    // Author citation
    author_citation: v.string(),
    basionym_author: v.optional(v.string()),
    
    // Type specimen
    type_specimen: v.optional(v.object({
      herbarium_code: v.string(),
      accession_number: v.string(),
      collector: v.string(),
      collection_date: v.number(),
      location: v.string(),
      holotype: v.boolean(),
    })),
    
    // Taxonomic confidence
    confidence: v.object({
      level: v.number(), // 0-100
      disputed: v.boolean(),
      alternative_classifications: v.array(v.object({
        classification: v.string(),
        supporters: v.array(v.string()),
        evidence: v.string(),
      })),
      molecular_support: v.boolean(),
      morphological_support: v.boolean(),
    }),
    
    // Index Fungorum & MycoBank
    identifiers: v.object({
      index_fungorum: v.optional(v.string()),
      mycobank: v.optional(v.string()),
      gbif: v.optional(v.string()),
      ncbi_taxid: v.optional(v.string()),
      eol_id: v.optional(v.string()),
      inaturalist_taxon: v.optional(v.string()),
    }),
  }))),
  
  // Molecular phylogeny
  phylogeny: v.optional(citedValue(v.object({
    // Evolutionary relationships
    clade: v.string(),
    sister_taxa: v.array(v.string()),
    divergence_time_mya: v.optional(v.number()), // million years ago
    
    // Genetic markers
    genetic_markers: v.optional(v.array(v.object({
      marker: v.string(), // ITS, LSU, RPB1, RPB2, TEF1
      sequence: v.optional(v.string()),
      genbank_accession: v.optional(v.string()),
      variability: v.number(), // 0-100%
    }))),
    
    // Genomic data
    genome: v.optional(v.object({
      size_mb: v.number(),
      gc_content: v.number(), // percentage
      chromosome_count: v.optional(v.number()),
      ploidy: v.optional(v.string()),
      sequencing_status: v.string(), // complete, draft, partial
      assembly_accession: v.optional(v.string()),
      gene_count: v.optional(v.number()),
      repeat_content: v.optional(v.number()), // percentage
    })),
    
    // Evolutionary traits
    evolutionary_innovations: v.array(v.object({
      trait: v.string(),
      emergence_mya: v.optional(v.number()),
      adaptive_value: v.string(),
    })),
  }))),
  
  // ===== MORPHOLOGY (Complete macro & micro characteristics) =====
  morphology: v.optional(citedValue(v.object({
    // Overall growth form
    growth_form: v.string(), // pileate, resupinate, coralloid, clavate, gastroid
    
    // Fruiting body architecture
    fruiting_body: v.object({
      type: v.string(), // mushroom, bracket, puffball, cup, coral, jelly
      
      // 3D measurements
      dimensions: v.object({
        height: v.object({ 
          min: v.number(), 
          max: v.number(), 
          typical: v.number(), 
          unit: v.string() 
        }),
        width: v.object({ 
          min: v.number(), 
          max: v.number(), 
          typical: v.number(), 
          unit: v.string() 
        }),
        thickness: v.optional(v.object({ 
          min: v.number(), 
          max: v.number(), 
          unit: v.string() 
        })),
        biomass: v.object({
          fresh_weight_g: v.object({ min: v.number(), max: v.number() }),
          dry_weight_g: v.object({ min: v.number(), max: v.number() }),
          water_content_percent: v.number(),
        }),
      }),
      
      // Developmental stages
      development: v.array(v.object({
        stage: v.string(), // button, young, mature, senescent
        duration_hours: v.object({ min: v.number(), max: v.number() }),
        morphological_changes: v.array(v.string()),
        size_percent_of_mature: v.number(),
      })),
    }),
    
    // Cap (pileus) details
    cap: v.optional(v.object({
      shape: v.array(v.string()), // convex, plane, depressed, umbonate
      shape_changes: v.optional(v.array(v.object({
        stage: v.string(),
        shape: v.string(),
      }))),
      
      diameter_mm: v.object({ 
        min: v.number(), 
        max: v.number(), 
        typical: v.number() 
      }),
      
      margin: v.object({
        shape: v.string(), // entire, crenate, split, striate
        appendiculate: v.boolean(), // veil remnants
        hygrophanous: v.boolean(), // changes color with moisture
      }),
      
      surface: v.object({
        texture: v.array(v.string()), // smooth, scaly, viscid, fibrillose
        patterns: v.array(v.string()), // concentric, radial, spotted
        separability: v.string(), // peelable, adherent
        hygroscopic: v.boolean(),
      }),
      
      context: v.object({
        thickness_mm: v.object({ min: v.number(), max: v.number() }),
        texture: v.string(), // fleshy, tough, woody
        color: v.string(),
        color_change_on_cutting: v.optional(v.string()),
        odor: v.optional(v.string()),
        taste: v.optional(v.string()),
      }),
    })),
    
    // Hymenophore (spore-bearing surface)
    hymenophore: v.object({
      type: v.string(), // gills, pores, teeth, smooth, ridged
      
      // Gills (if present)
      gills: v.optional(v.object({
        attachment: v.string(), // free, adnate, adnexed, decurrent
        spacing: v.string(), // crowded, close, subdistant, distant
        edge: v.string(), // entire, serrate, eroded
        forking: v.boolean(),
        interveined: v.boolean(),
        lamellulae: v.string(), // none, one-tier, two-tier, three-tier
        color_young: v.string(),
        color_mature: v.string(),
        staining: v.optional(v.string()),
      })),
      
      // Pores (if present)
      pores: v.optional(v.object({
        shape: v.string(), // round, angular, labyrinthine
        size_per_mm: v.object({ min: v.number(), max: v.number() }),
        depth_mm: v.number(),
        color: v.string(),
        bruising: v.optional(v.string()),
      })),
      
      // Teeth/spines (if present)
      teeth: v.optional(v.object({
        length_mm: v.object({ min: v.number(), max: v.number() }),
        density_per_cm2: v.number(),
        shape: v.string(), // conical, cylindrical, flattened
        decurrent: v.boolean(),
      })),
    }),
    
    // Stem (stipe) details
    stem: v.optional(v.object({
      present: v.boolean(),
      
      dimensions: v.object({
        height_mm: v.object({ min: v.number(), max: v.number() }),
        diameter_mm: v.object({
          apex: v.object({ min: v.number(), max: v.number() }),
          middle: v.object({ min: v.number(), max: v.number() }),
          base: v.object({ min: v.number(), max: v.number() }),
        }),
      }),
      
      shape: v.string(), // cylindrical, clavate, bulbous, rooting
      position: v.string(), // central, eccentric, lateral, absent
      
      surface: v.object({
        texture: v.array(v.string()), // smooth, fibrillose, scaly, reticulate
        color: v.string(),
        color_changes: v.optional(v.string()),
      }),
      
      interior: v.object({
        consistency: v.string(), // solid, stuffed, hollow
        context_color: v.string(),
        discoloration: v.optional(v.string()),
      }),
      
      base: v.object({
        shape: v.string(), // equal, bulbous, clavate, rooting
        mycelium: v.object({
          visible: v.boolean(),
          color: v.string(),
          rhizomorphs: v.boolean(),
        }),
      }),
    })),
    
    // Veil structures
    veil: v.optional(v.object({
      universal: v.optional(v.object({
        present: v.boolean(),
        remnants_on_cap: v.string(), // warts, patches, membrane
        volva: v.optional(v.object({
          type: v.string(), // saccate, friable, absent
          color: v.string(),
        })),
      })),
      
      partial: v.optional(v.object({
        present: v.boolean(),
        type: v.string(), // membranous, cortinate, fibrillose
        annulus: v.optional(v.object({
          position: v.string(), // superior, median, inferior
          persistence: v.string(), // persistent, evanescent, absent
          mobility: v.string(), // fixed, moveable
          texture: v.string(),
        })),
      })),
    })),
  }))),
  
  // ===== MICROSCOPY (Complete cellular details) =====
  microscopy: v.optional(citedValue(v.object({
    // Spore characteristics
    spores: v.object({
      // Dimensions
      size: v.object({
        length_um: v.object({ min: v.number(), max: v.number(), mean: v.number() }),
        width_um: v.object({ min: v.number(), max: v.number(), mean: v.number() }),
        Q_value: v.number(), // length/width ratio
      }),
      
      // Morphology
      shape: v.string(), // globose, ellipsoid, cylindrical, allantoid
      symmetry: v.string(), // bilateral, radial, asymmetric
      
      // Wall features
      wall: v.object({
        ornamentation: v.string(), // smooth, warted, spiny, reticulate
        thickness_um: v.number(),
        layers: v.number(),
        color_in_water: v.string(),
        color_in_KOH: v.string(),
      }),
      
      // Contents
      contents: v.object({
        oil_drops: v.boolean(),
        number_of_oil_drops: v.optional(v.number()),
        granular: v.boolean(),
        homogeneous: v.boolean(),
        guttulate: v.boolean(),
      }),
      
      // Chemical reactions
      reactions: v.object({
        amyloid: v.boolean(), // blue in Melzer's
        dextrinoid: v.boolean(), // red-brown in Melzer's
        cyanophilic: v.boolean(), // blue in Cotton Blue
        metachromatic: v.boolean(), // purple in Cresyl Blue
      }),
      
      // Germination
      germination: v.optional(v.object({
        pore: v.boolean(),
        pore_number: v.optional(v.number()),
        slit: v.boolean(),
      })),
      
      // Print characteristics
      spore_print: v.object({
        color: v.string(),
        density: v.string(), // light, medium, heavy
        pattern: v.optional(v.string()),
      }),
      
      // Production rate
      sporulation: v.object({
        spores_per_basidium: v.number(), // typically 2, 4, 6, or 8
        spores_per_mm2: v.optional(v.number()),
        daily_production: v.optional(v.number()),
        peak_time: v.optional(v.string()), // time of day
        triggers: v.array(v.string()), // humidity, light, temperature
      }),
    }),
    
    // Basidia
    basidia: v.object({
      type: v.string(), // holobasidiate, phragmobasidiate
      shape: v.string(), // clavate, cylindrical, urniform
      
      size: v.object({
        length_um: v.object({ min: v.number(), max: v.number() }),
        width_um: v.object({ min: v.number(), max: v.number() }),
      }),
      
      sterigmata: v.object({
        number: v.number(), // 2, 4, 6, 8
        length_um: v.number(),
      }),
      
      distribution: v.string(), // clustered, scattered, in hymenia
    }),
    
    // Sterile elements
    cystidia: v.object({
      // Cheilocystidia (gill edge)
      cheilocystidia: v.optional(v.object({
        present: v.boolean(),
        shape: v.string(), // fusiform, clavate, capitate, lageniform
        size_um: v.object({
          length: v.object({ min: v.number(), max: v.number() }),
          width: v.object({ min: v.number(), max: v.number() }),
        }),
        contents: v.optional(v.string()), // hyaline, refractive, pigmented
        wall_thickness: v.string(), // thin, thick
      })),
      
      // Pleurocystidia (gill face)
      pleurocystidia: v.optional(v.object({
        present: v.boolean(),
        frequency: v.string(), // absent, rare, scattered, abundant
        shape: v.string(),
        size_um: v.object({
          length: v.object({ min: v.number(), max: v.number() }),
          width: v.object({ min: v.number(), max: v.number() }),
        }),
        origin: v.string(), // subhymenial, deep in trama
      })),
      
      // Caulocystidia (stem)
      caulocystidia: v.optional(v.object({
        present: v.boolean(),
        distribution: v.string(), // apex only, throughout, clustered
        shape: v.string(),
        size_um: v.object({
          length: v.object({ min: v.number(), max: v.number() }),
          width: v.object({ min: v.number(), max: v.number() }),
        }),
      })),
      
      // Pileocystidia (cap)
      pileocystidia: v.optional(v.object({
        present: v.boolean(),
        type: v.string(),
        shape: v.string(),
      })),
    }),
    
    // Hyphal system
    hyphae: v.object({
      system: v.string(), // monomitic, dimitic, trimitic
      
      // Generative hyphae
      generative: v.object({
        width_um: v.object({ min: v.number(), max: v.number() }),
        septate: v.boolean(),
        clamped: v.boolean(), // clamp connections
        branching: v.string(), // rare, frequent, abundant
        wall_thickness: v.string(), // thin, thick
        contents: v.optional(v.string()),
      }),
      
      // Skeletal hyphae (if dimitic/trimitic)
      skeletal: v.optional(v.object({
        present: v.boolean(),
        width_um: v.object({ min: v.number(), max: v.number() }),
        wall_thickness: v.string(),
        branching: v.string(),
      })),
      
      // Binding hyphae (if trimitic)
      binding: v.optional(v.object({
        present: v.boolean(),
        width_um: v.object({ min: v.number(), max: v.number() }),
        branching: v.string(), // highly branched
      })),
      
      // Special structures
      specialized: v.optional(v.object({
        oleiferous: v.boolean(), // oil-bearing
        lactiferous: v.boolean(), // latex-bearing
        gloeoplerous: v.boolean(), // with refractive contents
        thromboplerous: v.boolean(), // with oil-like contents
      })),
    }),
    
    // Tissue structure
    tissues: v.object({
      // Cap flesh (context)
      pileus_trama: v.object({
        type: v.string(), // regular, irregular, cellular, interwoven
        hyphae_orientation: v.string(),
        gelatinization: v.boolean(),
      }),
      
      // Gill tissue
      hymenophoral_trama: v.optional(v.object({
        type: v.string(), // regular, bilateral, inverse, interwoven
        central_strand: v.optional(v.boolean()),
        width_um: v.optional(v.number()),
      })),
      
      // Cap surface
      pileipellis: v.object({
        type: v.string(), // cutis, trichoderm, hymeniderm, ixocutis
        thickness_um: v.optional(v.number()),
        differentiated: v.boolean(),
        gelatinized: v.boolean(),
      }),
      
      // Stem surface
      stipitipellis: v.optional(v.object({
        type: v.string(),
        caulocystidia: v.boolean(),
      })),
    }),
  }))),
  
  // ===== CHEMISTRY (Complete molecular architecture) =====
  chemistry: v.optional(citedValue(v.object({
    // Primary metabolites
    primaryMetabolites: v.object({
      // Macronutrients per 100g
      macronutrients: v.object({
        water_g: v.number(),
        energy_kcal: v.number(),
        protein_g: v.number(),
        total_fat_g: v.number(),
        carbohydrate_g: v.number(),
        dietary_fiber_g: v.number(),
        sugars_g: v.optional(v.number()),
        ash_g: v.number(),
      }),
      
      // Complete amino acid profile
      amino_acids_mg_per_100g: v.object({
        // Essential
        histidine: v.number(),
        isoleucine: v.number(),
        leucine: v.number(),
        lysine: v.number(),
        methionine: v.number(),
        phenylalanine: v.number(),
        threonine: v.number(),
        tryptophan: v.number(),
        valine: v.number(),
        
        // Non-essential
        alanine: v.optional(v.number()),
        arginine: v.optional(v.number()),
        aspartic_acid: v.optional(v.number()),
        cysteine: v.optional(v.number()),
        glutamic_acid: v.optional(v.number()),
        glycine: v.optional(v.number()),
        proline: v.optional(v.number()),
        serine: v.optional(v.number()),
        tyrosine: v.optional(v.number()),
        
        // Protein quality scores
        pdcaas_score: v.optional(v.number()), // Protein Digestibility Corrected Amino Acid Score
        biological_value: v.optional(v.number()),
      }),
      
      // Fatty acid profile
      fatty_acids_mg_per_100g: v.object({
        // Saturated
        saturated_total: v.number(),
        palmitic_16_0: v.optional(v.number()),
        stearic_18_0: v.optional(v.number()),
        
        // Monounsaturated
        monounsaturated_total: v.number(),
        oleic_18_1: v.optional(v.number()),
        palmitoleic_16_1: v.optional(v.number()),
        
        // Polyunsaturated
        polyunsaturated_total: v.number(),
        linoleic_18_2_n6: v.optional(v.number()),
        linolenic_18_3_n3: v.optional(v.number()),
        arachidonic_20_4_n6: v.optional(v.number()),
        epa_20_5_n3: v.optional(v.number()),
        dha_22_6_n3: v.optional(v.number()),
        
        // Ratios
        omega6_to_omega3: v.optional(v.number()),
        pufa_to_sfa: v.optional(v.number()),
      }),
      
      // Carbohydrate composition
      carbohydrates: v.object({
        total_g: v.number(),
        
        // Polysaccharides
        polysaccharides: v.array(v.object({
          name: v.string(), // chitin, beta-glucan, alpha-glucan
          amount_g: v.number(),
          type: v.string(), // structural, storage, bioactive
          linkages: v.string(), // β-1,3/1,6 etc
          molecular_weight_da: v.optional(v.number()),
          branching_degree: v.optional(v.number()),
          
          bioactivity: v.optional(v.object({
            immunomodulation: v.number(), // 0-10
            antitumor: v.number(),
            antioxidant: v.number(),
            prebiotic: v.number(),
          })),
        })),
        
        // Simple sugars
        monosaccharides_mg: v.optional(v.object({
          glucose: v.number(),
          fructose: v.number(),
          mannose: v.number(),
          galactose: v.number(),
          ribose: v.number(),
          arabinose: v.number(),
          xylose: v.number(),
          fucose: v.number(),
        })),
        
        // Sugar alcohols
        polyols_mg: v.optional(v.object({
          mannitol: v.number(),
          arabitol: v.number(),
          erythritol: v.number(),
          xylitol: v.number(),
          sorbitol: v.number(),
        })),
      }),
      
      // Vitamins
      vitamins: v.object({
        // Water-soluble
        thiamin_b1_mg: v.number(),
        riboflavin_b2_mg: v.number(),
        niacin_b3_mg: v.number(),
        pantothenic_acid_b5_mg: v.optional(v.number()),
        pyridoxine_b6_mg: v.optional(v.number()),
        biotin_b7_ug: v.optional(v.number()),
        folate_b9_ug: v.optional(v.number()),
        cobalamin_b12_ug: v.optional(v.number()),
        vitamin_c_mg: v.optional(v.number()),
        
        // Fat-soluble
        vitamin_a_iu: v.optional(v.number()),
        vitamin_d2_ug: v.optional(v.number()),
        vitamin_d3_ug: v.optional(v.number()),
        vitamin_e_mg: v.optional(v.number()),
        vitamin_k_ug: v.optional(v.number()),
        
        // Provitamins
        beta_carotene_ug: v.optional(v.number()),
        ergosterol_mg: v.optional(v.number()), // vitamin D2 precursor
      }),
      
      // Minerals
      minerals: v.object({
        // Macrominerals (mg)
        calcium_mg: v.number(),
        phosphorus_mg: v.number(),
        magnesium_mg: v.number(),
        sodium_mg: v.number(),
        potassium_mg: v.number(),
        chloride_mg: v.optional(v.number()),
        sulfur_mg: v.optional(v.number()),
        
        // Trace minerals (mg or μg)
        iron_mg: v.number(),
        zinc_mg: v.number(),
        copper_mg: v.number(),
        manganese_mg: v.number(),
        selenium_ug: v.number(),
        iodine_ug: v.optional(v.number()),
        chromium_ug: v.optional(v.number()),
        molybdenum_ug: v.optional(v.number()),
        cobalt_ug: v.optional(v.number()),
        fluoride_ug: v.optional(v.number()),
        boron_ug: v.optional(v.number()),
        silicon_mg: v.optional(v.number()),
        vanadium_ug: v.optional(v.number()),
        
        // Heavy metals (monitoring)
        cadmium_ug: v.optional(v.number()),
        lead_ug: v.optional(v.number()),
        mercury_ug: v.optional(v.number()),
        arsenic_ug: v.optional(v.number()),
      }),
    }),
    
    // Secondary metabolites
    secondaryMetabolites: v.object({
      // Bioactive compounds by class
      compound_classes: v.array(v.object({
        class: v.string(), // terpenoid, alkaloid, phenolic, peptide, polyketide
        
        compounds: v.array(v.object({
          name: v.string(),
          iupac_name: v.optional(v.string()),
          cas_number: v.optional(v.string()),
          
          // Structure
          molecular_formula: v.string(),
          molecular_weight: v.number(),
          smiles: v.optional(v.string()),
          inchi: v.optional(v.string()),
          
          // Concentration
          content: v.object({
            value: v.number(),
            unit: v.string(), // mg/g, μg/g, %
            location: v.string(), // fruiting body, mycelium, spores
            variability: v.optional(v.number()), // CV%
            
            // Factors affecting content
            factors: v.optional(v.object({
              developmental_stage: v.optional(v.string()),
              substrate: v.optional(v.string()),
              environmental: v.optional(v.array(v.string())),
            })),
          }),
          
          // Properties
          properties: v.object({
            solubility: v.array(v.string()), // water, ethanol, etc
            stability: v.object({
              heat: v.string(), // stable, labile, degrades at X°C
              pH: v.string(),
              light: v.string(),
              oxygen: v.string(),
            }),
            
            // Pharmacokinetics
            bioavailability: v.optional(v.number()), // %
            half_life: v.optional(v.object({
              value: v.number(),
              unit: v.string(),
            })),
            metabolism: v.optional(v.array(v.string())),
            excretion: v.optional(v.array(v.string())),
          }),
          
          // Bioactivity
          bioactivities: v.array(v.object({
            activity: v.string(),
            potency: v.optional(v.object({
              value: v.number(),
              unit: v.string(), // IC50, EC50, MIC, etc
            })),
            mechanism: v.optional(v.string()),
            
            // Molecular targets
            targets: v.optional(v.array(v.object({
              type: v.string(), // receptor, enzyme, channel
              name: v.string(),
              affinity: v.optional(v.object({
                value: v.number(),
                unit: v.string(), // Ki, Kd, IC50
              })),
              action: v.string(), // agonist, antagonist, inhibitor
            }))),
            
            evidence_level: v.string(), // in_vitro, in_vivo, clinical
          })),
          
          // Toxicology
          toxicity: v.optional(v.object({
            acute_ld50: v.optional(v.object({
              value: v.number(),
              unit: v.string(),
              route: v.string(),
              species: v.string(),
            })),
            chronic_noael: v.optional(v.object({
              value: v.number(),
              unit: v.string(),
            })),
            genotoxic: v.optional(v.boolean()),
            carcinogenic: v.optional(v.boolean()),
            organ_toxicity: v.optional(v.array(v.string())),
          })),
        })),
      })),
      
      // Biosynthetic pathways
      biosynthesis: v.optional(v.array(v.object({
        pathway: v.string(),
        type: v.string(), // PKS, NRPS, terpene, shikimate
        
        genes: v.optional(v.array(v.object({
          gene_name: v.string(),
          function: v.string(),
          genbank: v.optional(v.string()),
        }))),
        
        enzymes: v.array(v.object({
          name: v.string(),
          ec_number: v.optional(v.string()),
          reaction: v.string(),
          cofactors: v.optional(v.array(v.string())),
        })),
        
        precursors: v.array(v.string()),
        intermediates: v.array(v.string()),
        end_products: v.array(v.string()),
        
        regulation: v.optional(v.object({
          inducers: v.array(v.string()),
          repressors: v.array(v.string()),
          environmental_triggers: v.array(v.string()),
        })),
      }))),
      
      // Chemical fingerprint
      chemotype: v.object({
        profile: v.object({
          terpenoid_index: v.number(), // 0-100
          alkaloid_index: v.number(),
          phenolic_index: v.number(),
          peptide_index: v.number(),
          polyketide_index: v.number(),
        }),
        
        signature_compounds: v.array(v.string()),
        
        chemotaxonomic_markers: v.array(v.object({
          compound: v.string(),
          diagnostic_for: v.string(), // genus, family, etc
          specificity: v.string(), // unique, common, rare
        })),
      }),
    }),
    
    // Volatile organic compounds
    volatilome: v.object({
      total_vocs: v.number(),
      
      // Major volatiles
      compounds: v.array(v.object({
        name: v.string(),
        cas_number: v.optional(v.string()),
        
        // Concentration
        amount: v.object({
          value: v.number(),
          unit: v.string(), // μg/g, ppm, %
          method: v.string(), // SPME-GC-MS, etc
        }),
        
        // Sensory properties
        sensory: v.object({
          odor_descriptor: v.array(v.string()),
          odor_threshold_ppb: v.optional(v.number()),
          odor_activity_value: v.optional(v.number()), // concentration/threshold
          taste_descriptor: v.optional(v.array(v.string())),
        }),
        
        // Formation
        formation: v.object({
          pathway: v.string(), // enzymatic, oxidation, Maillard
          precursors: v.optional(v.array(v.string())),
          conditions: v.optional(v.array(v.string())), // heat, aging, damage
        }),
      })),
      
      // Aroma profile
      aroma_profile: v.object({
        primary_notes: v.array(v.string()),
        secondary_notes: v.array(v.string()),
        
        intensity: v.number(), // 0-10
        complexity: v.number(), // 0-10
        pleasantness: v.optional(v.number()), // 0-10
        
        // Evolution over time
        temporal_changes: v.optional(v.array(v.object({
          time_point: v.string(), // fresh, 1hr, 24hr, dried
          profile: v.array(v.string()),
          intensity: v.number(),
        }))),
      }),
    }),
    
    // Enzymes
    enzymes: v.optional(v.object({
      // Digestive enzymes
      digestive: v.array(v.object({
        name: v.string(),
        ec_number: v.string(),
        substrate: v.string(),
        activity: v.object({
          value: v.number(),
          unit: v.string(), // U/g, μmol/min/mg
        }),
        pH_optimum: v.number(),
        temperature_optimum: v.number(),
      })),
      
      // Ligninolytic enzymes
      ligninolytic: v.optional(v.array(v.object({
        enzyme: v.string(), // laccase, manganese peroxidase, lignin peroxidase
        activity: v.object({
          value: v.number(),
          unit: v.string(),
        }),
        substrates: v.array(v.string()),
        industrial_applications: v.optional(v.array(v.string())),
      }))),
      
      // Other industrially relevant
      industrial: v.optional(v.array(v.object({
        enzyme: v.string(),
        application: v.string(),
        activity: v.object({
          value: v.number(),
          unit: v.string(),
        }),
        stability: v.object({
          pH_range: v.object({ min: v.number(), max: v.number() }),
          temp_range: v.object({ min: v.number(), max: v.number() }),
          storage_days: v.number(),
        }),
      }))),
    })),
  }))),
  
  // ===== SENSORY PROFILE (Complete multi-sensory data) =====
  sensoryProfile: v.optional(citedValue(v.object({
    // Olfactory
    aroma: v.object({
      // Overall intensity
      intensity: v.object({
        fresh: v.number(), // 0-10
        dried: v.number(),
        cooked: v.number(),
      }),
      
      // Detailed aroma wheel
      aroma_wheel: v.array(v.object({
        primary_category: v.string(), // earthy, floral, fruity, vegetal, animal, chemical
        secondary_category: v.string(),
        specific_notes: v.array(v.string()),
        intensity: v.number(), // 0-10
        
        // Chemical basis
        contributing_compounds: v.optional(v.array(v.object({
          compound: v.string(),
          contribution: v.string(), // major, minor, trace
        }))),
      })),
      
      // Evolution
      temporal_evolution: v.array(v.object({
        stage: v.string(), // fresh, 1hr, 24hr, dried, cooked
        dominant_notes: v.array(v.string()),
        intensity: v.number(),
        pleasantness: v.number(), // -5 to +5
      })),
    }),
    
    // Gustatory
    taste: v.object({
      // Basic tastes
      basic_tastes: v.object({
        sweet: v.number(), // 0-10
        sour: v.number(),
        salty: v.number(),
        bitter: v.number(),
        umami: v.number(),
        
        // Additional
        astringent: v.optional(v.number()),
        pungent: v.optional(v.number()),
        cooling: v.optional(v.number()),
        metallic: v.optional(v.number()),
      }),
      
      // Flavor compounds
      taste_compounds: v.array(v.object({
        compound: v.string(),
        taste_quality: v.string(),
        threshold_mg_l: v.optional(v.number()),
        content_mg_100g: v.optional(v.number()),
      })),
      
      // Umami components
      umami_compounds: v.object({
        free_glutamate_mg: v.number(),
        nucleotides: v.object({
          amp_mg: v.optional(v.number()),
          gmp_mg: v.optional(v.number()),
          imp_mg: v.optional(v.number()),
        }),
        umami_peptides: v.optional(v.array(v.string())),
        synergy_factor: v.optional(v.number()), // multiplicative effect
      }),
      
      // Temporal profile
      taste_timeline: v.array(v.object({
        time_seconds: v.number(),
        dominant_taste: v.string(),
        intensity: v.number(),
        notes: v.optional(v.string()),
      })),
      
      // Aftertaste
      aftertaste: v.object({
        duration_seconds: v.number(),
        qualities: v.array(v.string()),
        pleasantness: v.number(), // -5 to +5
      }),
    }),
    
    // Tactile/Mouthfeel
    texture: v.object({
      // Raw texture
      raw: v.object({
        firmness: v.number(), // 0-10
        elasticity: v.number(),
        brittleness: v.number(),
        fibrousness: v.number(),
        juiciness: v.number(),
        sliminess: v.number(),
      }),
      
      // Cooked textures
      cooked: v.array(v.object({
        cooking_method: v.string(),
        firmness: v.number(),
        elasticity: v.number(),
        chewiness: v.number(),
        juiciness: v.number(),
        graininess: v.number(),
        creaminess: v.number(),
      })),
      
      // Mechanical properties
      mechanical: v.optional(v.object({
        hardness_n: v.optional(v.number()), // Newtons
        cohesiveness: v.optional(v.number()),
        springiness: v.optional(v.number()),
        chewiness: v.optional(v.number()),
        adhesiveness: v.optional(v.number()),
      })),
    }),
    
    // Visual (appearance)
    appearance: v.object({
      overall_appeal: v.number(), // 0-10
      
      color_stability: v.object({
        fresh: v.string(),
        oxidized_30min: v.optional(v.string()),
        bruised: v.optional(v.string()),
        cooked: v.optional(v.string()),
        dried: v.optional(v.string()),
      }),
      
      surface_properties: v.object({
        glossiness: v.number(), // 0-10
        transparency: v.number(),
        uniformity: v.number(),
      }),
    }),
    
    // Auditory
    sound: v.optional(v.object({
      // Natural sounds
      spore_discharge: v.optional(v.object({
        audible: v.boolean(),
        frequency_hz: v.optional(v.number()),
        mechanism: v.optional(v.string()),
      })),
      
      // Interaction sounds
      breaking: v.object({
        sound_type: v.string(), // crisp, soft, silent
        loudness: v.optional(v.number()), // dB
      }),
      
      cutting: v.object({
        resistance: v.string(), // none, slight, moderate, high
        sound: v.optional(v.string()),
      }),
    })),
  }))),
  
  // ===== ECOLOGY (Complete ecological relationships) =====
  ecology: v.optional(citedValue(v.object({
    // Functional role
    ecological_role: v.object({
      primary_role: v.string(),
      nutrient_cycling: v.optional(v.object({
        carbon: v.optional(v.string()),
        nitrogen: v.optional(v.string()),
        phosphorus: v.optional(v.string()),
      })),
      forest_health_impact: v.optional(v.string()),
      succession_stage: v.optional(v.string()),
    }),
    
    trophic_strategy: v.object({
      primary: v.string(),
      secondary: v.optional(v.string()),
      
      // Saprotrophic details
      saprotrophic: v.optional(v.object({
        substrate_type: v.string(), // wood, litter, dung, soil
        decay_type: v.string(), // white-rot, brown-rot, soft-rot
        
        substrates: v.array(v.object({
          substrate: v.string(),
          preference: v.number(), // 0-10
          decay_rate: v.optional(v.object({
            value: v.number(),
            unit: v.string(), // mg/day, %/month
          })),
          
          succession_stage: v.string(), // primary, secondary, tertiary
        })),
        
        enzyme_profile: v.array(v.object({
          enzyme: v.string(),
          activity_level: v.string(), // high, medium, low
        })),
      })),
      
      // Mycorrhizal details
      mycorrhizal: v.optional(v.object({
        type: v.string(), // ectomycorrhizal, endomycorrhizal, ericoid
        
        host_plants: v.array(v.object({
          species: v.string(),
          family: v.string(),
          specificity: v.string(), // obligate, preferential, facultative
          
          benefits_to_plant: v.array(v.string()),
          benefits_from_plant: v.array(v.string()),
          
          colonization: v.optional(v.object({
            root_tips_percent: v.number(),
            mantle_thickness_um: v.optional(v.number()),
            hartig_net_depth: v.optional(v.string()),
          })),
        })),
        
        mycorrhizal_network: v.optional(v.object({
          connects_plants: v.boolean(),
          nutrient_transfer: v.array(v.string()),
          signal_transfer: v.array(v.string()),
        })),
      })),
      
      // Parasitic details
      parasitic: v.optional(v.object({
        pathogenicity: v.string(), // weak, moderate, aggressive
        
        hosts: v.array(v.object({
          species: v.string(),
          tissue_infected: v.string(),
          disease_name: v.optional(v.string()),
          symptoms: v.array(v.string()),
          
          infection_process: v.object({
            entry_point: v.string(),
            colonization_rate: v.optional(v.string()),
            sporulation_time: v.optional(v.string()),
          }),
        })),
        
        control_methods: v.optional(v.array(v.string())),
      })),
    }),
    
    // Habitat requirements
    habitat: v.object({
      // Primary habitat
      primary_habitat: v.string(),
      habitat_specificity: v.string(), // specialist, generalist
      
      // Detailed habitats
      habitats: v.array(v.object({
        type: v.string(),
        frequency: v.string(), // common, occasional, rare
        
        vegetation: v.array(v.string()),
        soil_preference: v.optional(v.string()),
        
        microhabitat: v.optional(v.object({
          position: v.string(), // ground, wood, tree, etc
          substrate_age: v.optional(v.string()),
          moisture_preference: v.string(),
          light_preference: v.string(),
        })),
      })),
      
      // Elevation range
      elevation: v.object({
        min_m: v.number(),
        max_m: v.number(),
        optimal_m: v.optional(v.number()),
      }),
      
      // Soil requirements
      soil: v.optional(v.object({
        pH: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        
        texture: v.array(v.string()), // sand, silt, clay, loam
        
        nutrients: v.object({
          nitrogen: v.string(), // low, medium, high
          phosphorus: v.string(),
          potassium: v.string(),
          calcium: v.string(),
          organic_matter: v.string(),
        }),
        
        moisture: v.object({
          preference: v.string(), // xeric, mesic, hydric
          tolerance: v.string(), // drought, flooding
        }),
      })),
    }),
    
    // Species interactions
    interactions: v.object({
      // Symbioses
      symbionts: v.array(v.object({
        organism: v.string(),
        type: v.string(), // bacteria, fungi, plant, animal
        relationship: v.string(), // mutualistic, commensal
        
        interaction: v.object({
          benefits_given: v.array(v.string()),
          benefits_received: v.array(v.string()),
          mechanism: v.optional(v.string()),
          
          strength: v.number(), // 0-10
          obligate: v.boolean(),
        }),
      })),
      
      // Competition
      competitors: v.array(v.object({
        species: v.string(),
        resource: v.string(),
        
        competition: v.object({
          type: v.string(), // interference, exploitation
          intensity: v.number(), // 0-10
          
          outcome: v.string(), // dominates, dominated, coexists
          
          mechanisms: v.optional(v.array(v.string())), // antibiotics, faster growth
        }),
      })),
      
      // Predation/Grazing
      consumers: v.optional(v.array(v.object({
        organism: v.string(),
        type: v.string(), // insect, mollusk, mammal
        
        consumption: v.object({
          part_consumed: v.string(),
          impact: v.string(), // beneficial, neutral, harmful
          
          defenses: v.optional(v.array(v.string())), // toxins, spines, taste
        }),
      }))),
      
      // Facilitation
      facilitated_by: v.optional(v.array(v.object({
        organism: v.string(),
        mechanism: v.string(),
        importance: v.string(), // essential, beneficial, minor
      }))),
      
      facilitates: v.optional(v.array(v.object({
        organism: v.string(),
        mechanism: v.string(),
        importance: v.string(),
      }))),
    }),
    
    // Ecosystem functions
    ecosystem_services: v.object({
      // Nutrient cycling
      nutrient_cycling: v.array(v.object({
        process: v.string(), // decomposition, mineralization, immobilization
        nutrients: v.array(v.string()),
        rate: v.optional(v.string()),
        importance: v.string(), // high, medium, low
      })),
      
      // Soil formation
      soil_processes: v.optional(v.array(v.object({
        process: v.string(),
        mechanism: v.string(),
        impact: v.string(),
      }))),
      
      // Carbon cycling
      carbon_dynamics: v.optional(v.object({
        sequestration_rate: v.optional(v.object({
          value: v.number(),
          unit: v.string(), // kg C/m²/year
        })),
        
        decomposition_rate: v.optional(v.object({
          value: v.number(),
          unit: v.string(),
        })),
      })),
      
      // Other services
      additional_services: v.optional(v.array(v.object({
        service: v.string(),
        beneficiaries: v.array(v.string()),
        importance: v.string(),
      }))),
    }),
    
    // Population dynamics
    population: v.optional(v.object({
      // Dispersal
      dispersal: v.object({
        primary_vector: v.string(), // wind, water, animal
        
        vectors: v.array(v.object({
          vector: v.string(),
          effectiveness: v.number(), // 0-10
          distance: v.string(), // short, medium, long
        })),
        
        propagule_production: v.optional(v.object({
          spores_per_fruiting_body: v.optional(v.number()),
          viability_days: v.optional(v.number()),
          germination_rate: v.optional(v.number()), // %
        })),
      }),
      
      // Reproductive strategy
      reproduction: v.object({
        primary_mode: v.string(), // sexual, asexual, both
        
        sexual: v.optional(v.object({
          mating_system: v.string(), // homotallic, heterothallic
          mating_types: v.optional(v.number()),
          
          fruiting_triggers: v.array(v.string()),
          fruiting_frequency: v.string(),
        })),
        
        asexual: v.optional(v.object({
          methods: v.array(v.string()), // conidia, sclerotia, fragmentation
          frequency: v.string(),
        })),
        
        generation_time: v.optional(v.object({
          value: v.number(),
          unit: v.string(), // days, years
        })),
      }),
      
      // Population structure
      metapopulation: v.optional(v.object({
        genetic_diversity: v.optional(v.string()), // high, medium, low
        gene_flow: v.optional(v.string()),
        
        effective_population_size: v.optional(v.number()),
        
        conservation_units: v.optional(v.array(v.string())),
      })),
    })),
  }))),
  
  // ===== TEMPORAL PATTERNS (Complete time-based data) =====
  temporalPatterns: v.optional(citedValue(v.object({
    // Life cycle
    lifecycle: v.object({
      // Complete developmental sequence
      stages: v.array(v.object({
        stage: v.string(),
        
        duration: v.object({
          min: v.number(),
          max: v.number(),
          typical: v.number(),
          unit: v.string(), // hours, days, weeks
        }),
        
        conditions: v.object({
          temperature_c: v.object({ min: v.number(), max: v.number() }),
          humidity_percent: v.object({ min: v.number(), max: v.number() }),
          light: v.optional(v.string()),
        }),
        
        triggers: v.array(v.string()),
        
        morphology: v.object({
          description: v.string(),
          size: v.optional(v.string()),
          color: v.optional(v.string()),
        }),
        
        metabolic_activity: v.optional(v.string()), // high, medium, low
      })),
      
      // Generation time
      generation_time: v.object({
        sexual: v.optional(v.object({
          value: v.number(),
          unit: v.string(),
        })),
        asexual: v.optional(v.object({
          value: v.number(),
          unit: v.string(),
        })),
      }),
    }),
    
    // Phenology
    phenology: v.object({
      // Seasonal patterns
      seasonality: v.array(v.object({
        month: v.number(), // 1-12
        
        activity: v.object({
          mycelial_growth: v.number(), // 0-100
          primordia_formation: v.number(),
          fruiting: v.number(),
          sporulation: v.number(),
        }),
        
        environmental_correlation: v.optional(v.object({
          temperature: v.optional(v.number()),
          precipitation: v.optional(v.number()),
          photoperiod: v.optional(v.number()),
        })),
      })),
      
      peak_periods: v.object({
        fruiting: v.array(v.string()), // months
        sporulation: v.array(v.string()),
      }),
      
      // Geographic variation
      geographic_variation: v.optional(v.array(v.object({
        region: v.string(),
        climate_zone: v.string(),
        peak_months: v.array(v.number()),
      }))),
    }),
    
    // Circadian rhythms
    circadian: v.optional(v.object({
      // Daily patterns
      spore_release: v.optional(v.array(v.object({
        hour: v.number(), // 0-23
        relative_rate: v.number(), // 0-100
      }))),
      
      growth_rate: v.optional(v.array(v.object({
        hour: v.number(),
        rate: v.number(), // μm/hour
      }))),
      
      metabolic_rhythm: v.optional(v.array(v.object({
        hour: v.number(),
        process: v.string(),
        activity: v.number(), // 0-100
      }))),
      
      light_response: v.optional(v.object({
        phototropism: v.boolean(),
        photoperiod_sensitive: v.boolean(),
        optimal_photoperiod: v.optional(v.number()), // hours
      })),
    })),
    
    // Historical timeline
    history: v.object({
      // Discovery and taxonomy
      first_description: v.object({
        year: v.number(),
        author: v.string(),
        publication: v.string(),
        type_location: v.optional(v.string()),
      }),
      
      // Key milestones
      milestones: v.array(v.object({
        year: v.number(),
        event: v.string(),
        category: v.string(), // discovery, cultivation, research, commercial
        significance: v.string(),
        
        reference: citationSource,
      })),
      
      // Cultivation history
      cultivation_timeline: v.optional(v.array(v.object({
        year: v.number(),
        location: v.string(),
        method: v.string(),
        scale: v.string(), // experimental, commercial
      }))),
    }),
    
    // Future projections
    projections: v.optional(v.object({
      // Climate change impacts
      climate_response: v.array(v.object({
        scenario: v.string(), // RCP 2.6, 4.5, 6.0, 8.5
        year: v.number(),
        
        habitat_suitability: v.number(), // 0-100
        range_shift_km: v.optional(v.number()),
        
        phenology_shift_days: v.optional(v.number()),
      })),
      
      // Conservation outlook
      conservation_forecast: v.optional(v.object({
        threat_trajectory: v.string(), // increasing, stable, decreasing
        
        population_viability: v.optional(v.object({
          extinction_risk_percent: v.number(),
          time_horizon_years: v.number(),
        })),
      })),
    })),
  }))),
  
  // ===== GEOGRAPHY & DISTRIBUTION =====
  geography: v.optional(citedValue(v.object({
    // Native range
    native_range: v.object({
      continents: v.array(v.string()),
      
      countries: v.array(v.object({
        country: v.string(),
        status: v.string(), // common, rare, threatened
        
        regions: v.optional(v.array(v.object({
          region: v.string(),
          frequency: v.string(),
        }))),
      })),
      
      biogeographic_realms: v.array(v.string()),
      ecoregions: v.array(v.string()),
    }),
    
    // Introduced range
    introduced_range: v.optional(v.object({
      countries: v.array(v.object({
        country: v.string(),
        year_first_recorded: v.optional(v.number()),
        status: v.string(), // established, casual, eradicated
        
        pathway: v.optional(v.string()), // cultivation, accidental
      })),
      
      invasiveness: v.optional(v.object({
        invasive: v.boolean(),
        impact: v.optional(v.string()),
        management: v.optional(v.array(v.string())),
      })),
    })),
    
    // Occurrence data
    occurrences: v.object({
      // Observation records
      total_records: v.number(),
      
      data_sources: v.array(v.object({
        database: v.string(), // GBIF, iNaturalist, etc
        record_count: v.number(),
        date_range: v.object({
          start: v.number(),
          end: v.number(),
        }),
      })),
      
      // Spatial statistics
      spatial: v.optional(v.object({
        extent_of_occurrence_km2: v.optional(v.number()),
        area_of_occupancy_km2: v.optional(v.number()),
        
        fragmentation: v.optional(v.string()), // low, moderate, severe
      })),
    }),
    
    // Climate envelope
    climate_envelope: v.object({
      // Temperature
      temperature: v.object({
        mean_annual_c: v.object({ min: v.number(), max: v.number() }),
        
        coldest_month_c: v.object({ min: v.number(), max: v.number() }),
        warmest_month_c: v.object({ min: v.number(), max: v.number() }),
        
        frost_tolerance: v.string(), // none, light, hard
      }),
      
      // Precipitation
      precipitation: v.object({
        annual_mm: v.object({ min: v.number(), max: v.number() }),
        
        wettest_month_mm: v.object({ min: v.number(), max: v.number() }),
        driest_month_mm: v.object({ min: v.number(), max: v.number() }),
        
        seasonality: v.string(), // uniform, summer, winter, monsoonal
      }),
      
      // Other factors
      humidity: v.optional(v.object({
        annual_mean: v.object({ min: v.number(), max: v.number() }),
      })),
      
      // Bioclimatic variables
      bioclim: v.optional(v.object({
        bio1: v.optional(v.number()), // mean annual temperature
        bio12: v.optional(v.number()), // annual precipitation
        // ... other WorldClim variables
      })),
      
      // Köppen climate zones
      koppen_zones: v.array(v.string()),
    }),
  }))),
  
  // ===== CULTIVATION =====
  cultivation: v.optional(citedValue(v.object({
    // Cultivation status
    cultivation_status: v.string(), // not cultivated, experimental, commercial
    
    difficulty: v.object({
      overall: v.number(), // 0-10 (easy to very difficult)
      
      factors: v.array(v.object({
        factor: v.string(),
        difficulty: v.number(),
        solutions: v.array(v.string()),
      })),
      
      success_rate: v.optional(v.number()), // %
    }),
    
    // Growth parameters
    parameters: v.object({
      // Temperature requirements
      temperature_c: v.object({
        spawn_run: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        primordia: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        fruiting: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
      }),
      
      // Humidity
      humidity_percent: v.object({
        spawn_run: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        primordia: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        fruiting: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
      }),
      
      // CO2
      co2_ppm: v.object({
        spawn_run: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        fruiting: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
      }),
      
      // Light
      light: v.object({
        required_for_fruiting: v.boolean(),
        
        intensity_lux: v.optional(v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        })),
        
        photoperiod_hours: v.optional(v.number()),
        spectrum: v.optional(v.array(v.string())),
      }),
      
      // pH
      pH: v.object({
        spawn: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        substrate: v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        }),
        casing: v.optional(v.object({
          min: v.number(),
          max: v.number(),
          optimal: v.number(),
        })),
      }),
    }),
    
    // Substrates
    substrates: v.array(v.object({
      type: v.string(),
      category: v.string(), // primary, supplemented, experimental
      
      composition: v.array(v.object({
        ingredient: v.string(),
        percentage: v.number(),
      })),
      
      performance: v.object({
        colonization_days: v.number(),
        
        biological_efficiency: v.number(), // %
        
        yield_g_per_kg: v.object({
          first_flush: v.number(),
          total: v.number(),
        }),
        
        contamination_rate: v.number(), // %
        
        quality_score: v.number(), // 0-10
      }),
      
      preparation: v.object({
        moisture_content: v.number(), // %
        sterilization: v.string(),
        supplements: v.optional(v.array(v.string())),
      }),
      
      cost: v.optional(v.object({
        per_kg: v.number(),
        currency: v.string(),
      })),
    })),
    
    // Production cycle
    production_timeline: v.object({
      // Phases
      phases: v.array(v.object({
        phase: v.string(),
        
        duration_days: v.object({
          min: v.number(),
          max: v.number(),
          typical: v.number(),
        }),
        
        key_parameters: v.array(v.string()),
        
        critical_points: v.array(v.string()),
      })),
      
      // Total cycle
      total_cycle_days: v.object({
        min: v.number(),
        max: v.number(),
        typical: v.number(),
      }),
      
      // Flushes
      flushes: v.object({
        number: v.object({
          min: v.number(),
          max: v.number(),
          typical: v.number(),
        }),
        
        interval_days: v.number(),
        
        yield_distribution: v.array(v.object({
          flush: v.number(),
          percentage_of_total: v.number(),
        })),
      }),
    }),
    
    // Strains
    strains: v.optional(v.array(v.object({
      name: v.string(),
      code: v.optional(v.string()),
      
      origin: v.optional(v.object({
        location: v.string(),
        year: v.optional(v.number()),
        source: v.string(), // wild, cultivated, hybrid
      })),
      
      characteristics: v.object({
        vigor: v.number(), // 0-10
        yield: v.number(),
        
        temperature_preference: v.optional(v.string()), // cold, moderate, warm
        
        fruiting_reliability: v.number(), // 0-10
        
        morphology: v.optional(v.string()),
        
        special_features: v.optional(v.array(v.string())),
      }),
      
      availability: v.object({
        commercial: v.boolean(),
        suppliers: v.optional(v.array(v.string())),
      }),
    }))),
    
    // Pests and diseases
    cultivation_problems: v.optional(v.object({
      // Contaminants
      contaminants: v.array(v.object({
        organism: v.string(),
        type: v.string(), // bacteria, mold, yeast
        
        occurrence_rate: v.number(), // %
        
        conditions_favoring: v.array(v.string()),
        
        prevention: v.array(v.string()),
        treatment: v.array(v.string()),
      })),
      
      // Pests
      pests: v.optional(v.array(v.object({
        pest: v.string(),
        damage: v.string(),
        
        control: v.array(v.string()),
      }))),
      
      // Physiological disorders
      disorders: v.optional(v.array(v.object({
        disorder: v.string(),
        symptoms: v.array(v.string()),
        causes: v.array(v.string()),
        
        prevention: v.array(v.string()),
      }))),
    })),
  }))),
  
  // ===== MEDICINAL PROPERTIES =====
  medicinal: v.optional(citedValue(v.object({
    // Traditional use
    traditional_medicine: v.array(v.object({
      system: v.string(), // TCM, Ayurveda, Native American, etc
      
      traditional_name: v.string(),
      
      uses: v.array(v.object({
        condition: v.string(),
        preparation: v.string(),
        dosage: v.optional(v.string()),
        
        administration: v.string(),
        
        efficacy: v.optional(v.string()), // traditional claim
      })),
      
      contraindications: v.optional(v.array(v.string())),
      
      cultural_importance: v.number(), // 0-10
      
      documentation: v.object({
        first_recorded: v.optional(v.number()),
        
        texts: v.optional(v.array(v.string())),
      }),
    })),
    
    // Modern therapeutic applications
    therapeutic_categories: v.array(v.object({
      category: v.string(), // immunomodulation, neuroprotection, etc
      
      mechanisms: v.array(v.object({
        mechanism: v.string(),
        
        molecular_targets: v.optional(v.array(v.object({
          target_type: v.string(),
          target_name: v.string(),
          
          interaction: v.string(),
          
          affinity: v.optional(v.object({
            value: v.number(),
            unit: v.string(),
          })),
        }))),
        
        pathways: v.optional(v.array(v.string())),
        
        evidence_level: v.string(), // in_vitro, animal, human
      })),
      
      active_compounds: v.array(v.object({
        compound: v.string(),
        contribution: v.string(), // major, minor, synergistic
      })),
      
      efficacy_score: v.number(), // 0-10
    })),
    
    // Clinical evidence
    clinical_trials: v.optional(v.array(v.object({
      // Trial identification
      trial_id: v.optional(v.string()), // NCT number
      
      title: v.string(),
      year: v.number(),
      
      // Design
      design: v.object({
        type: v.string(), // RCT, observational, case-control
        
        blinding: v.string(), // single, double, open
        
        sample_size: v.number(),
        
        duration: v.object({
          value: v.number(),
          unit: v.string(),
        }),
      }),
      
      // Intervention
      intervention: v.object({
        preparation: v.string(),
        
        dosage: v.object({
          amount: v.number(),
          unit: v.string(),
          frequency: v.string(),
        }),
        
        standardization: v.optional(v.string()),
      }),
      
      // Outcomes
      outcomes: v.object({
        primary: v.array(v.object({
          measure: v.string(),
          result: v.string(),
          
          significance: v.optional(v.object({
            p_value: v.optional(v.number()),
            effect_size: v.optional(v.number()),
            confidence_interval: v.optional(v.string()),
          })),
        })),
        
        secondary: v.optional(v.array(v.object({
          measure: v.string(),
          result: v.string(),
        }))),
        
        adverse_events: v.optional(v.array(v.object({
          event: v.string(),
          frequency: v.string(),
          severity: v.string(),
        }))),
      }),
      
      // Quality assessment
      quality: v.object({
        jadad_score: v.optional(v.number()), // 0-5
        
        risk_of_bias: v.optional(v.string()),
      }),
      
      reference: citationSource,
    }))),
    
    // Safety profile
    safety: v.object({
      // Toxicity
      toxicity: v.object({
        acute: v.optional(v.object({
          ld50: v.optional(v.object({
            value: v.number(),
            unit: v.string(),
            route: v.string(),
            species: v.string(),
          })),
        })),
        
        chronic: v.optional(v.object({
          noael: v.optional(v.object({
            value: v.number(),
            unit: v.string(),
          })),
          
          loael: v.optional(v.object({
            value: v.number(),
            unit: v.string(),
          })),
        })),
        
        organ_specific: v.optional(v.array(v.object({
          organ: v.string(),
          effect: v.string(),
          severity: v.string(),
        }))),
      }),
      
      // Adverse effects
      adverse_effects: v.array(v.object({
        effect: v.string(),
        frequency: v.string(), // common, uncommon, rare
        severity: v.string(), // mild, moderate, severe
        
        mechanism: v.optional(v.string()),
      })),
      
      // Drug interactions
      drug_interactions: v.optional(v.array(v.object({
        drug_class: v.string(),
        
        interaction_type: v.string(),
        severity: v.string(),
        
        mechanism: v.string(),
        
        management: v.string(),
      }))),
      
      // Contraindications
      contraindications: v.array(v.string()),
      
      // Special populations
      special_populations: v.optional(v.object({
        pregnancy: v.string(),
        lactation: v.string(),
        pediatric: v.string(),
        geriatric: v.string(),
      })),
    }),
    
    // Dosage and administration
    dosing: v.optional(v.object({
      // Standard dosing
      standard: v.array(v.object({
        indication: v.string(),
        
        preparation: v.string(),
        
        dose: v.object({
          amount: v.object({
            min: v.number(),
            max: v.number(),
            unit: v.string(),
          }),
          
          frequency: v.string(),
          
          duration: v.optional(v.string()),
        }),
        
        route: v.string(),
      })),
      
      // Therapeutic monitoring
      monitoring: v.optional(v.array(v.string())),
    })),
  }))),
  
  // ===== CULINARY PROFILE =====
  culinary: v.optional(citedValue(v.object({
    // Edibility
    edibility: v.object({
      status: v.string(), // choice, edible, conditionally edible, inedible, poisonous
      
      rating: v.optional(v.number()), // 0-10
      
      preparation_required: v.optional(v.array(v.string())),
      
      warnings: v.optional(v.array(v.string())),
    }),
    
    // Culinary traditions
    traditions: v.array(v.object({
      culture: v.string(),
      
      names: v.array(v.string()),
      
      dishes: v.array(v.object({
        name: v.string(),
        
        description: v.string(),
        
        preparation_method: v.string(),
        
        accompaniments: v.array(v.string()),
        
        occasion: v.optional(v.string()), // everyday, festive, medicinal
      })),
      
      preservation_methods: v.array(v.string()),
      
      cultural_significance: v.number(), // 0-10
    })),
    
    // Flavor pairings
    pairings: v.array(v.object({
      ingredient: v.string(),
      
      affinity: v.number(), // 0-10
      
      basis: v.string(), // traditional, chemical, textural
      
      shared_compounds: v.optional(v.array(v.string())),
      
      preparation_notes: v.optional(v.string()),
    })),
    
    // Cooking methods
    cooking: v.array(v.object({
      method: v.string(),
      
      temperature: v.optional(v.object({
        value: v.number(),
        unit: v.string(),
      })),
      
      time: v.optional(v.object({
        min: v.number(),
        max: v.number(),
        unit: v.string(),
      })),
      
      effect_on_properties: v.object({
        texture: v.string(),
        flavor: v.string(),
        
        nutritional_retention: v.optional(v.number()), // %
        
        bioactive_retention: v.optional(v.number()),
      }),
      
      tips: v.array(v.string()),
    })),
    
    // Nutritional highlights
    nutritional_highlights: v.array(v.object({
      nutrient: v.string(),
      
      amount_per_100g: v.object({
        value: v.number(),
        unit: v.string(),
      }),
      
      daily_value_percent: v.optional(v.number()),
      
      significance: v.string(),
    })),
    
    // Storage and preservation
    storage: v.object({
      fresh: v.object({
        temperature_c: v.object({ min: v.number(), max: v.number() }),
        
        humidity: v.optional(v.string()),
        
        container: v.string(),
        
        shelf_life_days: v.number(),
        
        quality_indicators: v.array(v.string()),
      }),
      
      preservation: v.array(v.object({
        method: v.string(), // drying, freezing, pickling, etc
        
        process: v.string(),
        
        shelf_life: v.object({
          value: v.number(),
          unit: v.string(),
        }),
        
        quality_retention: v.number(), // %
      })),
    }),
  }))),
  
  // ===== ECONOMIC DATA =====
  economics: v.optional(citedValue(v.object({
    // Market status
    market_status: v.string(), // not traded, local, regional, international
    
    // Production
    production: v.optional(v.object({
      global_production_tons: v.optional(v.number()),
      
      major_producers: v.array(v.object({
        country: v.string(),
        
        production_tons: v.optional(v.number()),
        
        production_type: v.string(), // wild, cultivated
      })),
      
      production_trend: v.string(), // increasing, stable, decreasing
    })),
    
    // Pricing
    pricing: v.optional(v.object({
      // Retail prices
      retail: v.array(v.object({
        market: v.string(),
        
        product_form: v.string(), // fresh, dried, extract
        
        price: v.object({
          min: v.number(),
          max: v.number(),
          typical: v.number(),
          currency: v.string(),
          unit: v.string(),
        }),
        
        date: v.number(),
        
        quality_grade: v.optional(v.string()),
      })),
      
      // Wholesale
      wholesale: v.optional(v.array(v.object({
        market: v.string(),
        
        price_per_kg: v.object({
          value: v.number(),
          currency: v.string(),
        }),
        
        minimum_order: v.optional(v.number()),
      }))),
      
      // Price volatility
      volatility: v.optional(v.object({
        coefficient_of_variation: v.number(),
        
        seasonal_variation: v.array(v.object({
          month: v.number(),
          relative_price: v.number(), // % of annual average
        })),
      })),
    })),
    
    // Trade
    trade: v.optional(v.object({
      // International trade
      exports: v.optional(v.array(v.object({
        exporter: v.string(),
        
        volume_tons: v.optional(v.number()),
        value_usd: v.optional(v.number()),
      }))),
      
      imports: v.optional(v.array(v.object({
        importer: v.string(),
        
        volume_tons: v.optional(v.number()),
        value_usd: v.optional(v.number()),
      }))),
      
      // Trade agreements
      regulations: v.optional(v.array(v.object({
        type: v.string(),
        description: v.string(),
        
        countries_affected: v.array(v.string()),
      }))),
    })),
    
    // Value chain
    value_chain: v.optional(v.object({
      // Stages
      stages: v.array(v.object({
        stage: v.string(),
        
        value_added: v.number(), // %
        
        actors: v.array(v.string()),
        
        constraints: v.optional(v.array(v.string())),
      })),
      
      // End products
      products: v.array(v.object({
        product: v.string(),
        
        market_segment: v.string(),
        
        value_multiplier: v.number(), // vs raw material
      })),
    })),
    
    // Economic importance
    importance: v.object({
      // Direct value
      direct_value: v.optional(v.object({
        market_size_usd: v.optional(v.number()),
        
        employment: v.optional(v.number()),
        
        subsistence_value: v.optional(v.string()), // high, medium, low
      })),
      
      // Indirect value
      indirect_value: v.optional(v.array(v.object({
        type: v.string(), // ecosystem service, tourism, etc
        
        estimated_value: v.optional(v.object({
          amount: v.number(),
          currency: v.string(),
        })),
        
        beneficiaries: v.array(v.string()),
      }))),
    }),
  }))),
  
  // ===== CONSERVATION =====
  conservation: v.optional(citedValue(v.object({
    // Conservation status
    status: v.object({
      // IUCN Red List
      iucn: v.optional(v.object({
        category: v.string(), // EX, EW, CR, EN, VU, NT, LC, DD, NE
        
        criteria: v.optional(v.string()),
        
        year_assessed: v.number(),
        
        trend: v.string(), // decreasing, stable, increasing, unknown
      })),
      
      // National assessments
      national: v.optional(v.array(v.object({
        country: v.string(),
        
        status: v.string(),
        
        legal_protection: v.boolean(),
        
        year_assessed: v.optional(v.number()),
      }))),
      
      // CITES
      cites: v.optional(v.object({
        appendix: v.string(), // I, II, III
        
        year_listed: v.number(),
        
        annotation: v.optional(v.string()),
      })),
    }),
    
    // Threats
    threats: v.array(v.object({
      threat: v.string(),
      
      category: v.string(), // habitat loss, overharvesting, climate change, etc
      
      severity: v.string(), // critical, high, medium, low
      
      scope: v.string(), // whole range, majority, minority
      
      timing: v.string(), // ongoing, future, past
      
      details: v.optional(v.string()),
    })),
    
    // Conservation actions
    actions: v.object({
      // In-situ
      in_situ: v.optional(v.array(v.object({
        action: v.string(),
        
        location: v.optional(v.string()),
        
        implementer: v.optional(v.string()),
        
        effectiveness: v.optional(v.string()), // high, medium, low, unknown
      }))),
      
      // Ex-situ
      ex_situ: v.optional(v.array(v.object({
        method: v.string(), // culture collection, seed bank, etc
        
        institution: v.optional(v.string()),
        
        accessions: v.optional(v.number()),
        
        viability: v.optional(v.string()),
      }))),
      
      // Research needs
      research_needs: v.array(v.string()),
      
      // Management recommendations
      recommendations: v.array(v.string()),
    }),
  }))),
  
  // ===== CULTURAL SIGNIFICANCE =====
  cultural: v.optional(citedValue(v.object({
    // Ethnomycology
    ethnomycology: v.array(v.object({
      culture: v.string(),
      
      indigenous_name: v.string(),
      
      meaning: v.optional(v.string()),
      
      // Uses
      uses: v.array(v.object({
        use_type: v.string(), // food, medicine, spiritual, craft
        
        description: v.string(),
        
        preparation: v.optional(v.string()),
        
        importance: v.string(), // essential, important, minor
      })),
      
      // Knowledge transmission
      knowledge_system: v.object({
        transmission: v.string(), // oral, written, practice
        
        holders: v.string(), // elders, specialists, community
        
        status: v.string(), // thriving, maintained, threatened, lost
      }),
      
      // Spiritual/religious
      spiritual: v.optional(v.object({
        significance: v.string(),
        
        rituals: v.optional(v.array(v.string())),
        
        taboos: v.optional(v.array(v.string())),
        
        mythology: v.optional(v.array(v.string())),
      })),
    })),
    
    // Historical references
    history: v.array(v.object({
      period: v.string(),
      
      culture: v.string(),
      
      reference: v.object({
        type: v.string(), // text, artifact, art
        
        description: v.string(),
        
        source: v.optional(v.string()),
        
        date: v.optional(v.number()),
      }),
      
      significance: v.string(),
    })),
    
    // Art and literature
    arts: v.optional(v.array(v.object({
      medium: v.string(), // painting, sculpture, literature, film
      
      work: v.object({
        title: v.string(),
        
        creator: v.string(),
        
        year: v.optional(v.number()),
        
        description: v.string(),
      }),
      
      role: v.string(), // subject, symbol, prop
      
      cultural_impact: v.optional(v.string()),
    }))),
    
    // Modern culture
    contemporary: v.optional(v.object({
      // Popular culture
      pop_culture: v.optional(v.array(v.object({
        medium: v.string(),
        
        reference: v.string(),
        
        context: v.string(),
      }))),
      
      // Social movements
      movements: v.optional(v.array(v.object({
        movement: v.string(), // slow food, foraging revival, etc
        
        role: v.string(),
        
        advocates: v.optional(v.array(v.string())),
      }))),
      
      // Tourism
      tourism: v.optional(v.object({
        destinations: v.array(v.string()),
        
        activities: v.array(v.string()), // foraging tours, festivals
        
        economic_value: v.optional(v.string()),
      })),
    })),
  }))),
  
  // ===== RESEARCH & INNOVATION =====
  research: citedValue(v.object({
    // Research activity
    activity: v.object({
      publication_count: v.number(),
      
      publication_trend: v.string(), // increasing, stable, decreasing
      
      // Key research groups
      research_groups: v.optional(v.array(v.object({
        institution: v.string(),
        
        country: v.string(),
        
        focus_areas: v.array(v.string()),
        
        key_researchers: v.optional(v.array(v.string())),
      }))),
      
      // Hot topics
      current_topics: v.array(v.object({
        topic: v.string(),
        
        publications_per_year: v.optional(v.number()),
        
        key_findings: v.optional(v.array(v.string())),
      })),
    }),
    
    // Patents
    patents: v.optional(v.array(v.object({
      patent_number: v.string(),
      
      title: v.string(),
      
      year: v.number(),
      
      inventors: v.array(v.string()),
      
      assignee: v.optional(v.string()),
      
      application: v.string(),
      
      status: v.string(), // pending, granted, expired
    }))),
    
    // Biotechnology
    biotechnology: v.optional(v.object({
      // Applications
      applications: v.array(v.object({
        application: v.string(),
        
        technology: v.string(),
        
        development_stage: v.string(), // research, pilot, commercial
        
        potential_impact: v.string(),
      })),
      
      // Genetic engineering
      genetic_engineering: v.optional(v.object({
        modified_strains: v.optional(v.array(v.object({
          modification: v.string(),
          
          purpose: v.string(),
          
          status: v.string(),
        }))),
        
        gene_editing: v.optional(v.array(v.object({
          technique: v.string(), // CRISPR, etc
          
          target: v.string(),
          
          outcome: v.string(),
        }))),
      })),
      
      // Synthetic biology
      synthetic_biology: v.optional(v.array(v.object({
        approach: v.string(),
        
        product: v.string(),
        
        status: v.string(),
      }))),
    })),
    
    // Future potential
    potential: v.object({
      // Emerging applications
      emerging: v.array(v.object({
        application: v.string(),
        
        rationale: v.string(),
        
        development_timeline: v.optional(v.string()),
        
        challenges: v.array(v.string()),
      })),
      
      // Research gaps
      gaps: v.array(v.object({
        area: v.string(),
        
        importance: v.string(), // critical, high, medium
        
        description: v.string(),
      })),
      
      // Investment opportunities
      investment: v.optional(v.array(v.object({
        opportunity: v.string(),
        
        market_size: v.optional(v.object({
          value: v.number(),
          currency: v.string(),
        })),
        
        roi_potential: v.optional(v.string()),
      }))),
    }),
  })),
  
  // ===== INTERACTIONS & RELATIONSHIPS =====
  interactions: v.optional(citedValue(v.object({
    // Multi-species interactions
    multispecies: v.optional(v.array(v.object({
      organisms: v.array(v.string()),
      
      interaction_type: v.string(),
      
      network_position: v.string(), // central, peripheral, bridging
      
      stability: v.string(), // stable, dynamic, ephemeral
    }))),
    
    // Chemical ecology
    chemical_ecology: v.optional(v.object({
      // Allelopathy
      allelopathy: v.optional(v.array(v.object({
        target: v.string(),
        
        compound: v.string(),
        
        effect: v.string(),
        
        ecological_role: v.string(),
      }))),
      
      // Chemical communication
      communication: v.optional(v.array(v.object({
        signal: v.string(),
        
        receiver: v.string(),
        
        message: v.string(),
        
        ecological_context: v.string(),
      }))),
      
      // Defense compounds
      defense: v.optional(v.array(v.object({
        compound: v.string(),
        
        against: v.string(),
        
        mechanism: v.string(),
        
        effectiveness: v.string(),
      }))),
    })),
    
    // Microbiome
    microbiome: v.optional(v.object({
      // Associated bacteria
      bacteria: v.optional(v.array(v.object({
        taxon: v.string(),
        
        location: v.string(), // surface, internal
        
        relationship: v.string(),
        
        function: v.optional(v.string()),
      }))),
      
      // Associated fungi
      fungi: v.optional(v.array(v.object({
        species: v.string(),
        
        interaction: v.string(),
        
        outcome: v.string(),
      }))),
      
      // Community structure
      community: v.optional(v.object({
        diversity: v.string(), // high, medium, low
        
        core_taxa: v.array(v.string()),
        
        functional_groups: v.array(v.string()),
      })),
    })),
  }))),
  
  // ===== METADATA & QUALITY =====
  metadata: v.optional(v.object({
    // Record metadata
    record: v.optional(v.object({
      created: v.optional(v.number()),
      last_updated: v.optional(v.number()),
      
      version: v.optional(v.string()),
      
      contributors: v.optional(v.array(v.object({
        name: v.optional(v.string()),
        role: v.optional(v.string()),
        affiliation: v.optional(v.string()),
      }))),
      
      review_status: v.optional(v.string()), // draft, reviewed, verified
      
      completeness: v.optional(v.number()), // 0-100%
    })),
    
    // Data quality
    quality: v.optional(v.object({
      overall_confidence: v.optional(v.number()), // 0-100
      
      field_coverage: v.optional(v.object({
        taxonomy: v.optional(v.number()), // % fields filled
        morphology: v.optional(v.number()),
        chemistry: v.optional(v.number()),
        ecology: v.optional(v.number()),
        cultivation: v.optional(v.number()),
        medicinal: v.optional(v.number()),
        culinary: v.optional(v.number()),
      })),
      
      source_quality: v.optional(v.object({
        peer_reviewed_percent: v.optional(v.number()),
        
        primary_sources_percent: v.optional(v.number()),
        
        recent_sources_percent: v.optional(v.number()), // last 5 years
      })),
      
      verification: v.optional(v.object({
        expert_reviewed: v.optional(v.boolean()),
        
        field_verified: v.optional(v.boolean()),
        
        molecularly_confirmed: v.optional(v.boolean()),
      })),
    })),
    
    // Usage statistics
    usage: v.optional(v.object({
      views: v.optional(v.number()),
      
      citations: v.optional(v.number()),
      
      downloads: v.optional(v.number()),
      
      user_ratings: v.optional(v.object({
        accuracy: v.optional(v.number()), // 0-5
        completeness: v.optional(v.number()),
        usefulness: v.optional(v.number()),
        
        rating_count: v.optional(v.number()),
      })),
    })),
    
    // Related resources
    resources: v.optional(v.object({
      // External databases
      databases: v.optional(v.array(v.object({
        name: v.optional(v.string()),
        url: v.optional(v.string()),
        id: v.optional(v.string()),
      }))),
      
      // Key references
      key_references: v.optional(v.array(citationSource)),
      
      // Media
      media: v.optional(v.array(v.object({
        type: v.optional(v.string()), // video, audio, interactive
        
        url: v.optional(v.string()),
        
        description: v.optional(v.string()),
        
        license: v.optional(v.string()),
      }))),
    })),
  })),
})
  .index("by_seoName", ["seoName"])
  .index("by_slug", ["slug"])
  .index("by_commonName", ["commonName.value"])
  .index("by_latinName", ["latinName.value"])
  .index("by_genus", ["taxonomy.value.genus"])
  .index("by_family", ["taxonomy.value.family"])
  .index("by_conservationStatus", ["conservation.value.status.iucn.category"])
  .index("by_cultivationDifficulty", ["cultivation.value.difficulty.overall"])
  .index("by_lastUpdated", ["metadata.record.last_updated"]);

  // ===== SUPPORTING TABLES =====

/**
 * Source Citations Table
 * Central repository of all sources
 */
const sources = defineTable({
  // Source identification
  source_id: v.optional(v.string()), // unique identifier
  
  source_type: v.optional(v.string()), // human, digital, book, journal, database, observation, traditional, museum, herbarium
  
  // Detailed source data (same as citationSource)
  details: v.optional(citationSource),
  
  // Usage tracking
  usage_count: v.optional(v.number()),
  
  fungi_referenced: v.optional(v.array(v.id("fungi"))),
  
  // Validation
  validated: v.optional(v.boolean()),
  validation_date: v.optional(v.number()),
  validator: v.optional(v.string()),
  
  // Quality assessment
  quality_assessment: v.optional(v.object({
    accuracy: v.optional(v.number()), // 0-100
    completeness: v.optional(v.number()),
    timeliness: v.optional(v.number()),
    relevance: v.optional(v.number()),
    accessibility: v.optional(v.number()),
  })),
  
  // Notes
  notes: v.optional(v.string()),
  
  // Metadata
  added_date: v.optional(v.number()),
  last_accessed: v.optional(v.number()),
})
  .index("by_type", ["source_type"])
  .index("by_quality", ["details.quality.confidence"])
  .index("by_usage", ["usage_count"])
  .index("by_validation", ["validated"]);

/**
 * Relationships Table
 * Computed relationships between fungi
 */
const relationships = defineTable({
  source_fungus: v.optional(v.id("fungi")),
  target_fungus: v.optional(v.id("fungi")),
  
  // Relationship details
  relationship_type: v.optional(v.string()), // taxonomic, ecological, chemical, morphological, culinary, medicinal
  
  relationship_subtype: v.optional(v.string()), // more specific categorization
  
  strength: v.optional(v.number()), // 0-100
  
  confidence: v.optional(v.number()), // 0-100
  
  bidirectional: v.optional(v.boolean()),
  
  // Evidence
  evidence: v.optional(v.array(citationSource)),
  
  // Specific relationship data
  details: v.optional(v.object({
    // For ecological relationships
    ecological: v.optional(v.object({
      interaction_type: v.optional(v.string()),
      habitat_overlap: v.optional(v.number()),
      resource_competition: v.optional(v.number()),
    })),
    
    // For chemical relationships
    chemical: v.optional(v.object({
      shared_compounds: v.optional(v.array(v.string())),
      similarity_score: v.optional(v.number()),
      biosynthetic_distance: v.optional(v.number()),
    })),
    
    // For morphological relationships
    morphological: v.optional(v.object({
      similarity_score: v.optional(v.number()),
      shared_features: v.optional(v.array(v.string())),
      distinguishing_features: v.optional(v.array(v.string())),
    })),
    
    // For phylogenetic relationships
    phylogenetic: v.optional(v.object({
      distance: v.optional(v.number()),
      bootstrap_support: v.optional(v.number()),
      divergence_time_mya: v.optional(v.number()),
    })),
  })),
  
  // Temporal aspects
  temporal: v.optional(v.object({
    seasonal: v.optional(v.boolean()),
    peak_months: v.optional(v.array(v.number())),
    stability: v.optional(v.number()), // 0-100
  })),
  
  // Metadata
  computed_date: v.optional(v.number()),
  algorithm_version: v.optional(v.string()),
  last_verified: v.optional(v.number()),
})
  .index("by_source", ["source_fungus"])
  .index("by_target", ["target_fungus"])
  .index("by_type", ["relationship_type"])
  .index("by_strength", ["strength"])
  .index("by_confidence", ["confidence"]);

/**
 * Chemical Compounds Table
 * Master list of all chemical compounds found in fungi
 */
const compounds = defineTable({
  // Identity
  name: v.string(),
  iupac_name: v.optional(v.string()),
  cas_number: v.optional(v.string()),
  pubchem_cid: v.optional(v.string()),
  chemspider_id: v.optional(v.string()),
  
  // Structure
  molecular_formula: v.string(),
  molecular_weight: v.number(),
  smiles: v.optional(v.string()),
  inchi: v.optional(v.string()),
  inchi_key: v.optional(v.string()),
  
  // 3D structure
  structure_3d: v.optional(v.object({
    pdb_id: v.optional(v.string()),
    mol_file: v.optional(v.string()),
    conformers: v.optional(v.number()),
  })),
  
  // Classification
  class: v.string(), // terpenoid, alkaloid, phenolic, peptide, polyketide, etc.
  subclass: v.optional(v.string()),
  scaffold: v.optional(v.string()),
  
  // Physical properties
  properties: v.object({
    physical: v.object({
      state_at_rt: v.optional(v.string()), // solid, liquid, gas
      melting_point_c: v.optional(v.number()),
      boiling_point_c: v.optional(v.number()),
      density_g_cm3: v.optional(v.number()),
      solubility_water_mg_l: v.optional(v.number()),
      solubility_ethanol: v.optional(v.string()),
      logP: v.optional(v.number()),
      logD_pH7_4: v.optional(v.number()),
      pKa: v.optional(v.array(v.number())),
      polar_surface_area: v.optional(v.number()),
      rotatable_bonds: v.optional(v.number()),
    }),
    
    spectroscopic: v.optional(v.object({
      uv_max_nm: v.optional(v.array(v.number())),
      ir_peaks_cm1: v.optional(v.array(v.number())),
      nmr_1h: v.optional(v.string()),
      nmr_13c: v.optional(v.string()),
      ms_mz: v.optional(v.number()),
      ms_fragments: v.optional(v.array(v.number())),
    })),
    
    biological: v.optional(v.object({
      bioavailability_percent: v.optional(v.number()),
      plasma_half_life_hours: v.optional(v.number()),
      volume_distribution_l_kg: v.optional(v.number()),
      clearance_ml_min_kg: v.optional(v.number()),
      protein_binding_percent: v.optional(v.number()),
      bbb_permeability: v.optional(v.boolean()),
      pgp_substrate: v.optional(v.boolean()),
      cyp_interactions: v.optional(v.array(v.string())),
    })),
  }),
  
  // Fungi containing this compound
  found_in: v.array(v.object({
    fungus_id: v.id("fungi"),
    fungus_name: v.string(), // for quick reference
    
    concentration: v.optional(v.object({
      value: v.optional(v.number()),
      unit: v.optional(v.string()), // mg/g, μg/g, %
      variance: v.optional(v.number()),
    })),
    
    location: v.array(v.string()), // fruiting body, mycelium, spores
    
    conditions: v.optional(v.object({
      growth_stage: v.optional(v.string()),
      substrate: v.optional(v.string()),
      treatment: v.optional(v.string()),
    })),
    
    reference: citationSource,
  })),
  
  // Bioactivities
  bioactivities: v.array(v.object({
    activity: v.string(),
    
    potency: v.optional(v.object({
      value: v.optional(v.number()),
      unit: v.optional(v.string()), // IC50, EC50, MIC, Ki, etc.
      assay: v.optional(v.string()),
    })),
    
    mechanism: v.optional(v.string()),
    
    targets: v.optional(v.array(v.object({
      target_type: v.optional(v.string()),
      target_name: v.optional(v.string()),
      organism: v.optional(v.string()),
      pdb_id: v.optional(v.string()),
    }))),
    
    selectivity: v.optional(v.string()),
    
    evidence_level: v.optional(v.string()), // in_vitro, in_vivo, clinical
    
    reference: v.optional(citationSource),
  })),
  
  // Toxicology
  toxicology: v.optional(v.object({
    acute_toxicity: v.optional(v.object({
      ld50_oral_mg_kg: v.optional(v.number()),
      ld50_dermal_mg_kg: v.optional(v.number()),
      lc50_inhalation_mg_l: v.optional(v.number()),
      species: v.optional(v.array(v.string())),
    })),
    
    chronic_toxicity: v.optional(v.object({
      noael_mg_kg_day: v.optional(v.number()),
      loael_mg_kg_day: v.optional(v.number()),
      target_organs: v.optional(v.array(v.string())),
    })),
    
    genotoxicity: v.optional(v.boolean()),
    carcinogenicity: v.optional(v.string()), // IARC classification
    teratogenicity: v.optional(v.boolean()),
    
    environmental_toxicity: v.optional(v.object({
      ec50_daphnia_mg_l: v.optional(v.number()),
      lc50_fish_mg_l: v.optional(v.number()),
      bioaccumulation_factor: v.optional(v.number()),
    })),
  })),
  
  // Biosynthesis
  biosynthesis: v.optional(v.object({
    pathway_type: v.optional(v.string()),
    precursors: v.optional(v.array(v.string())),
    
    genes: v.optional(v.array(v.object({
      gene_name: v.optional(v.string()),
      genbank_accession: v.optional(v.string()),
      organism: v.optional(v.string()),
    }))),
    
    enzymes: v.optional(v.array(v.object({
      enzyme_name: v.optional(v.string()),
      ec_number: v.optional(v.string()),
      uniprot_id: v.optional(v.string()),
    }))),
  })),
  
  // Commercial information
  commercial: v.optional(v.object({
    available: v.optional(v.boolean()),
    suppliers: v.optional(v.array(v.string())),
    
    price_range: v.optional(v.object({
      min_usd_per_g: v.optional(v.number()),
      max_usd_per_g: v.optional(v.number()),
      purity: v.optional(v.string()),
    })),
    
    regulatory_status: v.optional(v.object({
      fda: v.optional(v.string()),
      ema: v.optional(v.string()),
      other: v.optional(v.array(v.string())),
    })),
  })),
  
  // Metadata
  created_date: v.optional(v.number()),
  last_updated: v.optional(v.number()),
  sources: v.optional(v.array(citationSource)),
})
  .index("by_name", ["name"])
  .index("by_class", ["class"])
  .index("by_formula", ["molecular_formula"])
  .index("by_cas", ["cas_number"]);

/**
 * Observations Table
 * Field observations and citizen science data
 */
const observations = defineTable({
  // What
  fungus_id: v.id("fungi"),
  
  // Identification confidence
  identification: v.object({
    confidence: v.number(), // 0-100
    method: v.string(), // visual, microscopy, molecular
    identified_by: v.optional(v.string()),
    verified: v.boolean(),
    
    alternative_ids: v.optional(v.array(v.object({
      species: v.string(),
      probability: v.number(),
    }))),
  }),
  
  // When
  observation_date: v.number(),
  observation_time: v.optional(v.string()),
  
  // Where
  location: v.object({
    coordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
      accuracy_m: v.optional(v.number()),
      elevation_m: v.optional(v.number()),
    }),
    
    place_name: v.string(),
    country: v.string(),
    state_province: v.optional(v.string()),
    locality: v.optional(v.string()),
    
    protected_area: v.optional(v.string()),
    
    habitat: v.object({
      type: v.string(),
      substrate: v.string(),
      host_species: v.optional(v.array(v.string())),
      vegetation_type: v.string(),
      disturbance_level: v.optional(v.string()),
    }),
  }),
  
  // Who
  observer: v.object({
    name: v.string(),
    user_id: v.optional(v.string()),
    affiliation: v.optional(v.string()),
    contact: v.optional(v.string()),
    experience_level: v.string(), // expert, advanced, intermediate, beginner
    
    equipment_used: v.optional(v.array(v.string())),
  }),
  
  // What was observed
  specimen_data: v.object({
    life_stage: v.string(),
    development_stage: v.string(),
    
    abundance: v.object({
      count: v.optional(v.number()),
      coverage_m2: v.optional(v.number()),
      abundance_class: v.string(), // single, few, many, abundant
    }),
    
    condition: v.string(), // pristine, good, fair, poor, dead
    
    measurements: v.optional(v.object({
      cap_diameter_mm: v.optional(v.array(v.number())),
      stem_height_mm: v.optional(v.array(v.number())),
      stem_diameter_mm: v.optional(v.array(v.number())),
      weight_g: v.optional(v.number()),
      custom: v.optional(v.array(v.object({
        parameter: v.string(),
        value: v.number(),
        unit: v.string(),
      }))),
    })),
    
    phenology: v.object({
      fruiting: v.boolean(),
      sporulating: v.boolean(),
      primordia_present: v.boolean(),
    }),
    
    associated_species: v.optional(v.array(v.object({
      species: v.string(),
      relationship: v.string(),
      abundance: v.string(),
    }))),
    
    notes: v.optional(v.string()),
  }),
  
  // Environmental conditions
  environment: v.optional(v.object({
    weather: v.optional(v.object({
      temperature_c: v.optional(v.number()),
      humidity_percent: v.optional(v.number()),
      precipitation_24h_mm: v.optional(v.number()),
      precipitation_7d_mm: v.optional(v.number()),
      wind_speed_kmh: v.optional(v.number()),
      conditions: v.optional(v.string()), // sunny, cloudy, rain, etc.
    })),
    
    soil: v.optional(v.object({
      moisture: v.optional(v.string()),
      pH: v.optional(v.number()),
      temperature_c: v.optional(v.number()),
      type: v.optional(v.string()),
    })),
    
    light: v.optional(v.object({
      canopy_cover_percent: v.optional(v.number()),
      exposure: v.optional(v.string()), // full sun, partial shade, full shade
    })),
  })),
  
  // Documentation
  documentation: v.object({
    photos: v.array(v.object({
      url: v.string(),
      type: v.string(), // habitat, specimen, microscopy, spore print
      caption: v.optional(v.string()),
      metadata: v.optional(v.object({
        camera: v.optional(v.string()),
        settings: v.optional(v.string()),
        scale: v.optional(v.string()),
      })),
    })),
    
    audio: v.optional(v.array(v.object({
      url: v.string(),
      description: v.string(),
      duration_seconds: v.number(),
    }))),
    
    specimens: v.optional(v.object({
      collected: v.boolean(),
      
      herbarium: v.optional(v.object({
        institution: v.string(),
        accession_number: v.string(),
        preservation_method: v.string(),
      })),
      
      cultures: v.optional(v.object({
        isolated: v.boolean(),
        strain_id: v.optional(v.string()),
        repository: v.optional(v.string()),
      })),
      
      samples: v.optional(v.array(v.object({
        type: v.string(), // tissue, spores, DNA
        storage_method: v.string(),
        location: v.string(),
      }))),
    })),
  }),
  
  // Source platform
  source: v.object({
    platform: v.string(), // iNaturalist, GBIF, MushroomObserver, direct
    
    platform_id: v.optional(v.string()),
    url: v.optional(v.string()),
    
    license: v.string(),
    
    import_date: v.number(),
  }),
  
  // Data quality
  quality: v.object({
    completeness: v.number(), // 0-100
    
    georeferencing_quality: v.string(),
    identification_quality: v.string(),
    documentation_quality: v.string(),
    
    flags: v.optional(v.array(v.string())), // needs_id, location_uncertain, date_uncertain
    
    research_grade: v.boolean(),
  }),
})
  .index("by_fungus", ["fungus_id"])
  .index("by_date", ["observation_date"])
  .index("by_location", ["location.country"])
  .index("by_observer", ["observer.name"])
  .index("by_platform", ["source.platform"])
  .index("by_quality", ["quality.research_grade"]);

/**
 * User Collections Table
 * Personal collections and research sets
 */
const userCollections = defineTable({
  // Owner
  user_id: v.string(),
  
  // Collection metadata
  name: v.string(),
  description: v.optional(v.string()),
  
  type: v.string(), // favorites, research, cultivation, foraging, medicinal, edible
  visibility: v.string(), // private, public, shared
  
  // Fungi in collection
  fungi: v.array(v.object({
    fungus_id: v.id("fungi"),
    
    added_date: v.number(),
    
    notes: v.optional(v.string()),
    
    tags: v.array(v.string()),
    
    personal_data: v.optional(v.object({
      locations: v.optional(v.array(v.object({
        name: v.string(),
        coordinates: v.optional(v.object({
          lat: v.number(),
          lon: v.number(),
        })),
        last_seen: v.optional(v.number()),
      }))),
      
      cultivation_notes: v.optional(v.string()),
      
      photos: v.optional(v.array(v.string())),
      
      rating: v.optional(v.number()), // 0-5
    })),
  })),
  
  // Collection statistics
  statistics: v.object({
    total_species: v.number(),
    families_represented: v.number(),
    
    last_updated: v.number(),
    
    view_count: v.optional(v.number()),
    
    citation_count: v.optional(v.number()),
  }),
  
  // Sharing
  sharing: v.object({
    shared_with: v.optional(v.array(v.object({
      user_id: v.string(),
      permission: v.string(), // view, edit
      shared_date: v.number(),
    }))),
    
    public_link: v.optional(v.string()),
    
    doi: v.optional(v.string()), // for citable collections
  }),
  
  // Metadata
  created: v.number(),
  modified: v.number(),
  
  version: v.number(),
  
  tags: v.array(v.string()),
})
  .index("by_user", ["user_id"])
  .index("by_type", ["type"])
  .index("by_visibility", ["visibility"])
  .index("by_modified", ["modified"]);

/**
 * Research Projects Table
 * Ongoing research and studies
 */
const researchProjects = defineTable({
  // Project identification
  project_id: v.string(),
  
  title: v.string(),
  
  description: v.string(),
  
  // Principal investigator
  pi: v.object({
    name: v.string(),
    institution: v.string(),
    contact: v.string(),
  }),
  
  // Team
  team: v.array(v.object({
    name: v.string(),
    role: v.string(),
    institution: v.optional(v.string()),
  })),
  
  // Fungi studied
  fungi_studied: v.array(v.object({
    fungus_id: v.id("fungi"),
    
    role_in_study: v.string(),
    
    sample_size: v.optional(v.number()),
  })),
  
  // Research details
  research: v.object({
    type: v.string(), // basic, applied, clinical
    
    field: v.array(v.string()), // taxonomy, ecology, chemistry, medicine, etc.
    
    methods: v.array(v.string()),
    
    objectives: v.array(v.string()),
    
    hypotheses: v.optional(v.array(v.string())),
  }),
  
  // Timeline
  timeline: v.object({
    start_date: v.number(),
    
    end_date: v.optional(v.number()),
    
    status: v.string(), // planning, active, completed, published
    
    milestones: v.array(v.object({
      date: v.number(),
      description: v.string(),
      completed: v.boolean(),
    })),
  }),
  
  // Outputs
  outputs: v.object({
    publications: v.optional(v.array(citationSource)),
    
    datasets: v.optional(v.array(v.object({
      name: v.string(),
      url: v.optional(v.string()),
      doi: v.optional(v.string()),
    }))),
    
    patents: v.optional(v.array(v.string())),
    
    presentations: v.optional(v.array(v.object({
      title: v.string(),
      event: v.string(),
      date: v.number(),
    }))),
  }),
  
  // Funding
  funding: v.optional(v.array(v.object({
    source: v.string(),
    
    grant_number: v.optional(v.string()),
    
    amount: v.optional(v.object({
      value: v.number(),
      currency: v.string(),
    })),
  }))),
  
  // Ethics
  ethics: v.optional(v.object({
    approval_required: v.boolean(),
    
    approval_number: v.optional(v.string()),
    
    approval_date: v.optional(v.number()),
    
    considerations: v.optional(v.array(v.string())),
  })),
  
  // Data availability
  data_availability: v.object({
    open_access: v.boolean(),
    
    repositories: v.optional(v.array(v.string())),
    
    embargo_until: v.optional(v.number()),
    
    license: v.optional(v.string()),
  }),
})
  .index("by_status", ["timeline.status"])
  .index("by_pi", ["pi.institution"])
  .index("by_start", ["timeline.start_date"]);

/**
 * User Interactions Table
 * Website interaction tracking for similarity calculations
 */
const userInteractions = defineTable({
  // Interaction type
  type: v.string(), // search, click, hover, view, filter, perspective_change
  
  // Entity reference
  entitySlug: v.optional(v.string()),
  
  // Search query
  query: v.optional(v.string()),
  
  // Perspective
  perspectiveId: v.optional(v.string()),
  
  // Active perspectives array (for perspective_change events)
  perspectives: v.optional(v.array(v.string())),
  
  // Timing
  timestamp: v.number(),
  
  // Session tracking
  sessionId: v.optional(v.string()),
  
  // Additional data
  metadata: v.optional(v.any()),
})
  .index("by_entity", ["entitySlug"])
  .index("by_session", ["sessionId"])
  .index("by_timestamp", ["timestamp"]);

/**
 * Export the complete schema
 */
export default defineSchema({
  fungi,
  sources,
  relationships,
  compounds,
  observations,
  userCollections,
  researchProjects,
  userInteractions,
});