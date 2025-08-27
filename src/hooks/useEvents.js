// hooks/useEvents.js
import { useEffect, useMemo, useState } from "react";

/** Normalize folder (strip trailing slashes) */
function normalizeFolder(urlOrFolder) {
    if (!urlOrFolder) return "";
    return String(urlOrFolder).replace(/\/+$/, "");
}

/** Resolve sources:
 * - string ending with .json → single file
 * - array → list of files
 * - folder → try <folder>/index.json or <folder>/manifest.json
 *   (supports ["a.json"] or [{href:"a.json"}])
 * - fallback: <folder>/data.json
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
            const urls = list
                .map((x) => (typeof x === "string" ? x : x?.href))
                .filter(Boolean)
                .map((u) => (u.startsWith("http") ? u : `${base}/${u.replace(/^\/+/, "")}`));
            if (urls.length) return urls;
        } catch {
            /* try next candidate */
        }
    }

    return [`${base}/data.json`];
}

// Extract facets
function extractFacets(raw) {
    const industries = new Set();
    const tags = new Set();
    const companies = new Set();
    const mentioned = new Set();
    const origins = new Set();
    const years = new Set();
    const aiModels = new Set();
    const aiTypes = new Set();

    (raw || []).forEach((o) => {
        (o.industry || []).forEach((i) => industries.add(i));
        (o.tags || []).forEach((t) => tags.add(t));
        if (o.company_name) companies.add(o.company_name);
        (o.companies_mentioned || []).forEach((c) => mentioned.add(c));
        if (o.source_origin) origins.add(o.source_origin);
        if (o.year != null) years.add(Number(o.year));
        if (o.ai_model) aiModels.add(o.ai_model);
        if (o.ai_model_type) aiTypes.add(o.ai_model_type);
    });

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
    };
}

export default function useEvents(urlOrFolder) {
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
