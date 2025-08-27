// utils/filters.js
const textIn = (hay = "", needle = "") =>
    String(hay).toLowerCase().includes(String(needle).toLowerCase());

export function applyEventFiltersAndSort(
    list = [],
    {
        search = "",
        industryTab = "All",
        tags = [],
        years = [],
        companies = [],
        mentioned = [],
        origins = [],
        aiModels = [],
        aiTypes = [],
        sortBy = "year_desc",
    } = {}
) {
    const s = search.trim().toLowerCase();
    const tagSet = new Set(tags);
    const yearSet = new Set(years.map(Number));
    const compSet = new Set(companies);
    const mentSet = new Set(mentioned);
    const origSet = new Set(origins);
    const aiModelSet = new Set(aiModels);
    const aiTypeSet = new Set(aiTypes);

    let out = list.filter((o) => {
        // Tab: industry
        if (industryTab !== "All") {
            if (!Array.isArray(o.industry) || !o.industry.includes(industryTab)) return false;
        }

        // Search
        if (s) {
            const blob = [
                o.title,
                o.description,
                (o.tags || []).join(" "),
                (o.industry || []).join(" "),
                (o.companies_mentioned || []).join(" "),
                o.company_name,
                o.source_name,
                o.ai_model,
                o.ai_model_type,
            ]
                .filter(Boolean)
                .join(" • ")
                .toLowerCase();
            if (!blob.includes(s)) return false;
        }

        // Tags: must include all selected
        if (tagSet.size) {
            const t = new Set(o.tags || []);
            for (const need of tagSet) if (!t.has(need)) return false;
        }

        // Year: any of selected
        if (yearSet.size && !yearSet.has(Number(o.year))) return false;

        // Company: any of selected
        if (compSet.size && !compSet.has(o.company_name)) return false;

        // Mentioned companies: must include all selected
        if (mentSet.size) {
            const cm = new Set(o.companies_mentioned || []);
            for (const need of mentSet) if (!cm.has(need)) return false;
        }

        // Source origin: any selected
        if (origSet.size) {
            if (!o.source_origin || !origSet.has(o.source_origin)) return false;
        }

        // AI model / type
        if (aiModelSet.size && !aiModelSet.has(o.ai_model)) return false;
        if (aiTypeSet.size && !aiTypeSet.has(o.ai_model_type)) return false;

        return true;
    });

    // Sorting
    if (sortBy === "year_desc") {
        out.sort(
            (a, b) =>
                Number(b.year || 0) - Number(a.year || 0) ||
                String(a.title).localeCompare(String(b.title))
        );
    } else if (sortBy === "title_asc") {
        out.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }

    return out;
}
