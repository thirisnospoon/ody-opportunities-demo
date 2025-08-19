const textIn = (hay = "", needle = "") =>
    String(hay).toLowerCase().includes(String(needle).toLowerCase());

export function applyFiltersAndSort(list = [], {
    search = "",
    industryTab = "All",
    tags = [],
    years = [],
    companies = [],
    mentioned = [],
    origins = [],
    sortBy = "year_desc",
} = {}) {
    const s = search.trim().toLowerCase();
    const tagSet = new Set(tags);
    const yearSet = new Set(years.map(Number));
    const compSet = new Set(companies);
    const mentSet = new Set(mentioned);
    const origSet = new Set(origins);

    let out = list.filter((o) => {
        // Tab by industry
        if (industryTab !== "All") {
            if (!Array.isArray(o.industry) || !o.industry.includes(industryTab)) return false;
        }

        // Search over multiple fields
        if (s) {
            const blob = [
                o.title, o.description, o.example,
                (o.tags || []).join(" "),
                (o.industry || []).join(" "),
                (o.companies_mentioned || []).join(" "),
                o.company_name,
                o.source_name,
            ].join(" • ").toLowerCase();
            if (!blob.includes(s)) return false;
        }

        // Tag filter (all selected tags must be present)
        if (tagSet.size) {
            const t = new Set(o.tags || []);
            for (const need of tagSet) if (!t.has(need)) return false;
        }

        // Year filter (ANY of selected years)
        if (yearSet.size && !yearSet.has(Number(o.year))) return false;

        // Company filter (ANY)
        if (compSet.size && !compSet.has(o.company_name)) return false;

        // Companies mentioned (ALL)
        if (mentSet.size) {
            const cm = new Set(o.companies_mentioned || []);
            for (const need of mentSet) if (!cm.has(need)) return false;
        }

        // Origin filter (ANY)
        if (origSet.size) {
            if (!o.source_origin || !origSet.has(o.source_origin)) return false;
        }

        return true;
    });

    // Sorting
    if (sortBy === "year_desc") {
        out.sort((a, b) => (Number(b.year || 0) - Number(a.year || 0)) || String(a.title).localeCompare(String(b.title)));
    } else if (sortBy === "title_asc") {
        out.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }

    return out;
}
