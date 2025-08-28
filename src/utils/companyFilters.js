// utils/companyFilters.js
function matchesSearch(company, q) {
    if (!q) return true;
    const s = q.trim().toLowerCase();
    const hay = [
        company.company_short_name,
        company.company_full_name,
        company.company_website,
        company.core_products,
        ...(company.industries || []),
        ...(company.tags || []),
        ...(company.products || []).map((p) => `${p.product_name} ${p.product_description}`),
        ...(company.services || []).map((sv) => `${sv.service_name || ""} ${sv.service_description || ""}`),
        ...(company.recent_moves || []).map((mv) => `${mv.move_name} ${mv.move_description}`),
        ...(company.partnerships || []).map((pr) => `${pr.partnership_name} ${pr.partnership_description}`),
        ...(company.active_countries || []).map((ac) => `${ac.country_name} ${ac.activity_description || ""}`),
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return hay.includes(s) || s.split(/\s+/).every((tok) => hay.includes(tok));
}

function filterByIndustries(company, industries) {
    if (!industries?.length) return true;
    const cs = new Set(company.industries || []);
    return industries.some((i) => cs.has(i));
}

function filterByCountries(company, countries) {
    if (!countries?.length) return true;
    const cs = new Set((company.active_countries || []).map((c) => c.country_name));
    return countries.some((i) => cs.has(i));
}

function sortCompanies(arr, sortBy) {
    const copy = [...arr];
    switch (sortBy) {
        case "founded_desc":
            return copy.sort((a, b) => Number(b.founded || 0) - Number(a.founded || 0));
        case "founded_asc":
            return copy.sort((a, b) => Number(a.founded || 0) - Number(b.founded || 0));
        case "name_desc":
            return copy.sort((a, b) =>
                String(b.company_full_name || b.company_short_name || "").localeCompare(
                    String(a.company_full_name || a.company_short_name || "")
                )
            );
        case "name_asc":
        default:
            return copy.sort((a, b) =>
                String(a.company_full_name || a.company_short_name || "").localeCompare(
                    String(b.company_full_name || b.company_short_name || "")
                )
            );
    }
}

export function applyCompanyFilters(data, { search, industries, countries, sortBy }) {
    const filtered = (data || []).filter(
        (c) => matchesSearch(c, search) && filterByIndustries(c, industries) && filterByCountries(c, countries)
    );
    return sortCompanies(filtered, sortBy);
}
