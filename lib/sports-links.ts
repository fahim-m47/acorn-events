const HAVERFORD_SPORTS_BASE_URL = 'https://haverfordathletics.com/sports'

export interface SportLink {
  label: string
  href: string
}

export interface SportCategory {
  label: string
  sports: SportLink[]
}

export const SPORTS_CATEGORIES: SportCategory[] = [
  {
    label: "Men's Sports",
    sports: [
      { label: 'Baseball', href: `${HAVERFORD_SPORTS_BASE_URL}/baseball` },
      {
        label: "Men's Basketball",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-basketball`,
      },
      {
        label: "Men's Cross Country",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-cross-country`,
      },
      {
        label: "Men's Fencing",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-fencing`,
      },
      {
        label: "Men's Lacrosse",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-lacrosse`,
      },
      { label: "Men's Soccer", href: `${HAVERFORD_SPORTS_BASE_URL}/msoc` },
      {
        label: "Men's Squash",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-squash`,
      },
      { label: "Men's Tennis", href: `${HAVERFORD_SPORTS_BASE_URL}/mten` },
      {
        label: "Men's Indoor Track & Field",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-indoor-track`,
      },
      {
        label: "Men's Outdoor Track & Field",
        href: `${HAVERFORD_SPORTS_BASE_URL}/mens-track-and-field`,
      },
    ],
  },
  {
    label: "Women's Sports",
    sports: [
      {
        label: "Women's Basketball",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-basketball`,
      },
      {
        label: "Women's Cross Country",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-cross-country`,
      },
      {
        label: "Women's Fencing",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-fencing`,
      },
      {
        label: 'Field Hockey',
        href: `${HAVERFORD_SPORTS_BASE_URL}/field-hockey`,
      },
      {
        label: "Women's Lacrosse",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-lacrosse`,
      },
      {
        label: "Women's Soccer",
        href: `${HAVERFORD_SPORTS_BASE_URL}/wsoc`,
      },
      { label: 'Softball', href: `${HAVERFORD_SPORTS_BASE_URL}/softball` },
      {
        label: "Women's Squash",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-squash`,
      },
      { label: "Women's Tennis", href: `${HAVERFORD_SPORTS_BASE_URL}/wten` },
      {
        label: "Women's Indoor Track & Field",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-indoor-track`,
      },
      {
        label: "Women's Outdoor Track & Field",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-track-and-field`,
      },
      {
        label: "Women's Volleyball",
        href: `${HAVERFORD_SPORTS_BASE_URL}/womens-volleyball`,
      },
    ],
  },
  {
    label: 'Co-Ed',
    sports: [{ label: 'Cricket', href: `${HAVERFORD_SPORTS_BASE_URL}/cricket` }],
  },
]
