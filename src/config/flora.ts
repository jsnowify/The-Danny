import { SPECIES_IDS } from "./discoveries";
export type PlantId = (typeof SPECIES_IDS)[number];
export type Plant = {
  id: PlantId;
  name: string;
  common: string;
  scientific: string;
  description: string;
  source: string;
  color: string;
  tree: boolean;
  radius: number;
  landmark: readonly [number, number];
};
const nparks = "https://www.nparks.gov.sg/florafaunaweb/flora/";
const entries: Omit<Plant, "id">[] = [
  {
    name: "Narra",
    common: "Narra",
    scientific: "Pterocarpus indicus",
    description:
      "A spreading crown, gently drooping branches and small yellow flowers. Look for golden accents among the painted leaves.",
    source: nparks + "3/0/3093",
    color: "#a3ad68",
    tree: true,
    radius: 0.18,
    landmark: [12, -19],
  },
  {
    name: "Rain Tree",
    common: "Acacia / Akasya",
    scientific: "Samanea saman",
    description:
      "A broad umbrella crown with fine, divided foliage. Its open branching makes a shaded avenue in this forest.",
    source: nparks + "3/1/3106",
    color: "#7e996c",
    tree: true,
    radius: 0.2,
    landmark: [-12, 15],
  },
  {
    name: "Mango",
    common: "Mangga",
    scientific: "Mangifera indica",
    description:
      "Long, narrow leaves gather into a dense crown. This illustration adds a few warm fruit shapes beneath the foliage.",
    source: nparks + "3/0/3013",
    color: "#728b54",
    tree: true,
    radius: 0.17,
    landmark: [9, 18],
  },
  {
    name: "Coconut",
    common: "Niyog",
    scientific: "Cocos nucifera",
    description:
      "A slender palm with long feathered fronds. Here its curved trunk and spreading leaflets make a light shoreline silhouette.",
    source: "https://www.nzpcn.org.nz/flora/species/cocos-nucifera/",
    color: "#95ad73",
    tree: true,
    radius: 0.13,
    landmark: [26, 8],
  },
  {
    name: "Banana",
    common: "Saging",
    scientific: "Musa species and cultivars",
    description:
      "Broad leaf blades rise from a pseudostem. The painted model shows arching, gently split leaves rather than a woody tree crown.",
    source:
      "https://gardeningsg.nparks.gov.sg/gardening-resource-library/good-allotment-gardening-practices/",
    color: "#a5b879",
    tree: true,
    radius: 0.16,
    landmark: [29, -4],
  },
  {
    name: "Bamboo",
    common: "Kawayan",
    scientific: "Bambusa vulgaris inspiration",
    description:
      "Clustered jointed culms carry narrow leaves. Listen for a quiet wooden tone in Bamboo Whisper.",
    source: "https://www.naturalheritage.gov.ck/species/5801-bambusa-vulgaris",
    color: "#9ca56f",
    tree: true,
    radius: 0.38,
    landmark: [-20, -4],
  },
  {
    name: "Banyan Fig",
    common: "Balete",
    scientific: "Ficus species; F. microcarpa inspiration",
    description:
      "Balete refers to several fig trees. This illustration uses a spreading crown and hanging aerial roots inspired by banyan figs.",
    source:
      "https://www.nparks.gov.sg/docs/default-source/parks-docs/fort-canning-park/fort-canning-park-trees-fort-trail.pdf",
    color: "#71886d",
    tree: true,
    radius: 0.33,
    landmark: [-15, -27],
  },
  {
    name: "Tropical Almond",
    common: "Talisay",
    scientific: "Terminalia catappa",
    description:
      "Horizontal layers of branches hold broad leaves. The stepped, spreading silhouette is the clue to look for near the pond.",
    source: nparks + "3/1/3181",
    color: "#a1ad77",
    tree: true,
    radius: 0.18,
    landmark: [30, 16],
  },
  {
    name: "Coastal She-oak",
    common: "Agoho",
    scientific: "Casuarina equisetifolia",
    description:
      "Fine drooping branchlets give this tree a feathery outline. Its narrow illustrated crown differs from the broad-leaved trees.",
    source: "https://www.mnhn.fr/en/filao-tree",
    color: "#839a85",
    tree: true,
    radius: 0.14,
    landmark: [-31, 19],
  },
  {
    name: "Frangipani",
    common: "Kalachuchi",
    scientific: "Plumeria rubra",
    description:
      "Simple branching supports clusters of five-petalled flowers. This forest's illustration uses cream petals with warm centers.",
    source: nparks + "3/0/3074",
    color: "#a9b384",
    tree: false,
    radius: 0,
    landmark: [10, 29],
  },
  {
    name: "Arabian Jasmine",
    common: "Sampaguita",
    scientific: "Jasminum sambac",
    description:
      "A small shrub with white flowers. Tiny cream blossoms also appear in the Memory Tree's flower strings.",
    source:
      "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:609755-1/general-information",
    color: "#9fae79",
    tree: false,
    radius: 0,
    landmark: [-6, 7.8],
  },
  {
    name: "Ferns",
    common: "Pako / fern forms",
    scientific: "Fern group; stylized frond study",
    description:
      "Arching fronds with many small leaflets. This entry represents a fern form, rather than identifying every fern as one species.",
    source: "https://www.nparks.gov.sg/florafaunaweb/species-search",
    color: "#8bab81",
    tree: false,
    radius: 0,
    landmark: [-12, -23],
  },
  {
    name: "Taro",
    common: "Gabi",
    scientific: "Colocasia esculenta",
    description:
      "Broad, heart-like leaf blades stand on long stalks. Find the illustrated leaves near the water's edge.",
    source:
      "https://www.wetlandpark.gov.hk/en/biodiversity/beauty-of-wetlands/wildlife/colocasia-esculenta",
    color: "#b0be94",
    tree: false,
    radius: 0,
    landmark: [12, 3],
  },
  {
    name: "Cogon Grass",
    common: "Cogon / Kugon",
    scientific: "Imperata cylindrica",
    description:
      "Upright narrow blades and pale, fluffy flower heads. This painted clump adds light strokes to Old Stone Ridge.",
    source: "https://plants.ces.ncsu.edu/plants/imperata-cylindrica/",
    color: "#c3c59d",
    tree: false,
    radius: 0,
    landmark: [25, 26],
  },
  {
    name: "Ixora",
    common: "Santan",
    scientific: "Ixora coccinea inspiration",
    description:
      "Small tubular flowers gather into rounded clusters. The illustration uses restrained coral accents in the meadow.",
    source:
      "https://biodiversitysg.nparks.gov.sg/our-biodiversity/flowering-plants/shrubs-herbaceous-plants/ixora-cultivars/",
    color: "#a1b280",
    tree: false,
    radius: 0,
    landmark: [17, 30],
  },
  {
    name: "Hibiscus",
    common: "Gumamela",
    scientific: "Hibiscus rosa-sinensis",
    description:
      "Broad flower petals surround a projecting central column. Look for the small terracotta blooms along the meadow's edge.",
    source: "https://plants.ces.ncsu.edu/plants/hibiscus-rosa-sinensis/",
    color: "#9eac7a",
    tree: false,
    radius: 0,
    landmark: [26, 27],
  },
];
export const PLANTS: Plant[] = entries.map((plant, i) => ({
  ...plant,
  id: SPECIES_IDS[i],
}));
export const PLANT_BY_ID = Object.fromEntries(
  PLANTS.map((p) => [p.id, p]),
) as Record<PlantId, Plant>;
