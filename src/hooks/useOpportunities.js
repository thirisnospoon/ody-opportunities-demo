import { useEffect, useMemo, useState } from "react";

/** Допоміжне: нормалізувати шлях до папки */
function normalizeFolder(urlOrFolder) {
    if (!urlOrFolder) return "";
    return String(urlOrFolder).replace(/\/+$/, "");
}

/** Гнучкий резольвер джерел:
 *  - якщо string із .json → один файл
 *  - якщо array → список файлів
 *  - якщо string без .json → трактуємо як папку й пробуємо:
 *      <folder>/index.json або <folder>/manifest.json (очікуємо масив
 *      рядків або об’єктів виду { href: "file.json" })
 */
async function resolveSources(urlOrFolder) {
    if (Array.isArray(urlOrFolder)) return urlOrFolder;

    const src = String(urlOrFolder || "").trim();
    if (!src) return [];

    if (src.toLowerCase().endsWith(".json")) return [src];

    const base = normalizeFolder(src);
    const candidates = [`${base}/index.json`, `${base}/manifest.json`];

    for (const idxUrl of candidates) {
        try {
            const res = await fetch(idxUrl, { cache: "no-store" });
            if (!res.ok) continue;
            const arr = await res.json();
            const list = Array.isArray(arr) ? arr : [];
            // Підтримуємо як ["a.json","b.json"], так і [{href:"a.json"}]
            const urls = list
                .map((x) => (typeof x === "string" ? x : x?.href))
                .filter(Boolean)
                .map((u) => (u.startsWith("http") ? u : `${base}/${u.replace(/^\/+/, "")}`));
            if (urls.length) return urls;
        } catch {
            /* ignore and try next candidate */
        }
    }

    // Фолбек на legacy випадок: <folder>/data2.json
    return [`${base}/data.json`];
}

// Витягаємо унікальні, відсортовані фасети, + межі оцінок
function extractFacets(raw) {
    const industries = new Set();
    const tags = new Set();
    const companies = new Set();
    const mentioned = new Set();
    const origins = new Set();
    const years = new Set();
    const aiModels = new Set();
    const aiTypes = new Set();

    let minMark = Number.POSITIVE_INFINITY;
    let maxMark = Number.NEGATIVE_INFINITY;

    (raw || []).forEach((o) => {
        (o.industry || []).forEach((i) => industries.add(i));
        (o.tags || []).forEach((t) => tags.add(t));
        if (o.company_name) companies.add(o.company_name);
        (o.companies_mentioned || []).forEach((c) => mentioned.add(c));
        if (o.source_origin) origins.add(o.source_origin);
        if (o.year != null) years.add(Number(o.year));
        if (o.ai_model) aiModels.add(o.ai_model);
        if (o.ai_model_type) aiTypes.add(o.ai_model_type);

        if (typeof o.opportunity_mark === "number" && !Number.isNaN(o.opportunity_mark)) {
            minMark = Math.min(minMark, o.opportunity_mark);
            maxMark = Math.max(maxMark, o.opportunity_mark);
        }
    });

    if (minMark === Number.POSITIVE_INFINITY) minMark = 0;
    if (maxMark === Number.NEGATIVE_INFINITY) maxMark = 10;

    const toSorted = (s) =>
        Array.from(s).sort((a, b) => {
            if (typeof a === "number" && typeof b === "number") return b - a;
            return String(a).localeCompare(String(b));
        });

    return {
        industries: toSorted(industries),
        tags: toSorted(tags),
        companies: toSorted(companies),
        mentioned: toSorted(mentioned),
        origins: toSorted(origins),
        years: toSorted(years),
        ai_models: toSorted(aiModels),
        ai_types: toSorted(aiTypes),
        marksRange: [Math.floor(minMark), Math.ceil(maxMark)],
    };
}

export default function useOpportunities(urlOrFolder) {
    const [data, setData] = useState([]);
    const [facets, setFacets] = useState({
        industries: [],
        tags: [],
        companies: [],
        mentioned: [],
        origins: [],
        years: [],
        ai_models: [],
        ai_types: [],
        marksRange: [0, 10],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const sources = await resolveSources(urlOrFolder);

                const responses = await Promise.allSettled(
                    sources.map((u) =>
                        fetch(u, { cache: "no-store", signal: controller.signal }).then((r) => {
                            if (!r.ok) throw new Error(`HTTP ${r.status} @ ${u}`);
                            return r.json();
                        })
                    )
                );

                if (!active) return;

                // Збираємо всі масиви/об’єкти в один масив
                const merged = [];
                const errs = [];

                responses.forEach((res) => {
                    if (res.status === "fulfilled") {
                        const json = res.value;
                        if (Array.isArray(json)) merged.push(...json);
                        else if (json && typeof json === "object") merged.push(json);
                    } else {
                        errs.push(res.reason?.message || String(res.reason));
                    }
                });

                setData(merged);
                setFacets(extractFacets(merged));
                setError(errs.length ? errs.join(" | ") : null);
            } catch (e) {
                if (!active) return;
                setError(e.message || String(e));
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
            controller.abort();
        };
    }, [urlOrFolder]);

    const memoedFacets = useMemo(() => facets, [facets]);

    return { data, facets: memoedFacets, loading, error };
}
