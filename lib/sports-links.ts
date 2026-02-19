const HAVERFORD_SPORTS_BASE_URL = 'https://haverfordathletics.com/sports'

export interface SportLink {
  label: string
  href: string
  slug: string
}

export interface SportCategory {
  label: string
  sports: SportLink[]
}

function sportEntry(label: string, slug: string): SportLink {
  return { label, href: `${HAVERFORD_SPORTS_BASE_URL}/${slug}`, slug }
}

export const SPORTS_CATEGORIES: SportCategory[] = [
  {
    label: "Men's Sports",
    sports: [
      sportEntry('Baseball', 'baseball'),
      sportEntry("Men's Basketball", 'mens-basketball'),
      sportEntry("Men's Cross Country", 'mens-cross-country'),
      sportEntry("Men's Fencing", 'mens-fencing'),
      sportEntry("Men's Lacrosse", 'mens-lacrosse'),
      sportEntry("Men's Soccer", 'msoc'),
      sportEntry("Men's Squash", 'mens-squash'),
      sportEntry("Men's Tennis", 'mten'),
      sportEntry("Men's Indoor Track & Field", 'mens-indoor-track'),
      sportEntry("Men's Outdoor Track & Field", 'mens-track-and-field'),
    ],
  },
  {
    label: "Women's Sports",
    sports: [
      sportEntry("Women's Basketball", 'womens-basketball'),
      sportEntry("Women's Cross Country", 'womens-cross-country'),
      sportEntry("Women's Fencing", 'womens-fencing'),
      sportEntry('Field Hockey', 'field-hockey'),
      sportEntry("Women's Lacrosse", 'womens-lacrosse'),
      sportEntry("Women's Soccer", 'wsoc'),
      sportEntry('Softball', 'softball'),
      sportEntry("Women's Squash", 'womens-squash'),
      sportEntry("Women's Tennis", 'wten'),
      sportEntry("Women's Indoor Track & Field", 'womens-indoor-track'),
      sportEntry("Women's Outdoor Track & Field", 'womens-track-and-field'),
      sportEntry("Women's Volleyball", 'womens-volleyball'),
    ],
  },
  {
    label: 'Co-Ed',
    sports: [sportEntry('Cricket', 'cricket')],
  },
]

const allSports = SPORTS_CATEGORIES.flatMap((c) => c.sports)

export function getSportBySlug(slug: string): SportLink | undefined {
  return allSports.find((s) => s.slug === slug)
}

export function getAllSportSlugs(): string[] {
  return allSports.map((s) => s.slug)
}
