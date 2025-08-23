const textIn = (hay = "", needle = "") =>
    String(hay).toLowerCase().includes(String(needle).toLowerCase());

export function applyFiltersAndSort(
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
        marksRange = [0, 10],
        strictMark = false, // якщо true — елементи без оцінки виключаємо з результатів
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

    const [minMark, maxMark] = marksRange.map(Number);

    let out = list.filter((o) => {
        // Вкладка індустрії
        if (industryTab !== "All") {
            if (!Array.isArray(o.industry) || !o.industry.includes(industryTab)) return false;
        }

        // Пошук
        if (s) {
            const blob = [
                o.title,
                o.description,
                o.example,
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

        // Теги: всі вибрані мусять бути в записі
        if (tagSet.size) {
            const t = new Set(o.tags || []);
            for (const need of tagSet) if (!t.has(need)) return false;
        }

        // Рік: будь-який із вибраних
        if (yearSet.size && !yearSet.has(Number(o.year))) return false;

        // Компанія: будь-яка із вибраних
        if (compSet.size && !compSet.has(o.company_name)) return false;

        // Згадані компанії: всі вибрані мусять бути в записі
        if (mentSet.size) {
            const cm = new Set(o.companies_mentioned || []);
            for (const need of mentSet) if (!cm.has(need)) return false;
        }

        // Походження джерела: будь-яке
        if (origSet.size) {
            if (!o.source_origin || !origSet.has(o.source_origin)) return false;
        }

        // AI модель: будь-яка
        if (aiModelSet.size && !aiModelSet.has(o.ai_model)) return false;

        // Тип AI моделі: будь-який
        if (aiTypeSet.size && !aiTypeSet.has(o.ai_model_type)) return false;

        // Оцінка (діапазон)
        if (Array.isArray(marksRange) && marksRange.length === 2) {
            const val = Number(o.opportunity_mark);
            const hasVal = !Number.isNaN(val);
            if (strictMark) {
                if (!hasVal) return false;
                if (val < minMark || val > maxMark) return false;
            } else {
                // Якщо значення є — перевірити діапазон; якщо нема — пропускаємо
                if (hasVal && (val < minMark || val > maxMark)) return false;
            }
        }

        return true;
    });

    // Сортування
    if (sortBy === "year_desc") {
        out.sort(
            (a, b) =>
                (Number(b.year || 0) - Number(a.year || 0)) ||
                String(a.title).localeCompare(String(b.title))
        );
    } else if (sortBy === "title_asc") {
        out.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    } else if (sortBy === "mark_desc") {
        out.sort(
            (a, b) =>
                (Number(b.opportunity_mark || -Infinity) - Number(a.opportunity_mark || -Infinity)) ||
                String(a.title).localeCompare(String(b.title))
        );
    }

    return out;
}
