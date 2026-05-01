export const AMENITY_OPTIONS = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "breakfast", label: "Breakfast" },
  { value: "parking", label: "Parking" },
  { value: "pool", label: "Pool" },
  { value: "gym", label: "Gym" },
  { value: "spa", label: "Spa" },
  { value: "bar", label: "Bar" },
  { value: "kitchen", label: "Kitchen" },
];

export const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-rating", label: "Top rated" },
  { value: "name", label: "Name: A → Z" },
  { value: "-name", label: "Name: Z → A" },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 1000;
export const PRICE_STEP = 10;

export const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "3", label: "3+ stars" },
  { value: "4", label: "4+ stars" },
  { value: "5", label: "5 stars" },
];

const DEFAULTS = {
  q: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minStars: "",
  amenities: [],
  sort: "",
  page: 1,
  pageSize: 10,
};

export function readFilters(searchParams) {
  const get = (k) => searchParams.get(k) ?? "";
  return {
    q: get("q"),
    city: get("city"),
    minPrice: get("minPrice"),
    maxPrice: get("maxPrice"),
    minStars: get("minStars"),
    amenities: get("amenities")
      ? get("amenities").split(",").filter(Boolean)
      : [],
    sort: get("sort"),
    page: Number(get("page")) || 1,
    pageSize: Number(get("pageSize")) || 10,
  };
}

export function filtersToParams(filters) {
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === "" || value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value.join(",");
      continue;
    }
    if (key === "page" && value === 1) continue;
    if (key === "pageSize" && value === DEFAULTS.pageSize) continue;
    params[key] = value;
  }
  return params;
}

export function filtersToApiQuery(filters) {
  const q = {};
  if (filters.q) q.q = filters.q;
  if (filters.city) q.city = filters.city;
  if (filters.minPrice !== "" && filters.minPrice != null)
    q.minPrice = Number(filters.minPrice);
  if (filters.maxPrice !== "" && filters.maxPrice != null)
    q.maxPrice = Number(filters.maxPrice);
  if (filters.minStars) q.minStars = Number(filters.minStars);
  if (filters.amenities?.length) q.amenities = filters.amenities.join(",");
  if (filters.sort) q.sort = filters.sort;
  q.page = filters.page ?? 1;
  q.pageSize = filters.pageSize ?? 10;
  return q;
}

export function isEmpty(filters) {
  return (
    !filters.q &&
    !filters.city &&
    filters.minPrice === "" &&
    filters.maxPrice === "" &&
    !filters.minStars &&
    (!filters.amenities || filters.amenities.length === 0) &&
    !filters.sort
  );
}

export const FILTER_DEFAULTS = DEFAULTS;
