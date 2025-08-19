import { useEffect, useMemo, useState } from "react";

// Extract unique, sorted facets
function extractFacets(raw) {
    const industries = new Set();
    const tags = new Set();
    const companies = new Set();
    const mentioned = new Set();
    const origins = new Set();
    const years = new Set();

    (raw || []).forEach((o) => {
        (o.industry || []).forEach((i) => industries.add(i));
        (o.tags || []).forEach((t) => tags.add(t));
        companies.add(o.company_name);
        (o.companies_mentioned || []).forEach((c) => mentioned.add(c));
        if (o.source_origin) origins.add(o.source_origin);
        if (o.year != null) years.add(Number(o.year));
    });

    const toSorted = (s) => Array.from(s).sort((a, b) => {
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
    };
}

export default function useOpportunities(url) {
    const [data, setData] = useState([]);
    const [facets, setFacets] = useState({
        industries: [],
        tags: [],
        companies: [],
        mentioned: [],
        origins: [],
        years: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!active) return;

                // If the JSON is a single object, coerce to array; otherwise assume array.
                const arr = Array.isArray(json) ? json : [json];
                setData(arr);
                setFacets(extractFacets(arr));
                setError(null);
            } catch (e) {
                setError(e.message || String(e));
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [url]);

    // If needed, expose derived data here
    const memoedFacets = useMemo(() => facets, [facets]);

    return { data, facets: memoedFacets, loading, error };
}
