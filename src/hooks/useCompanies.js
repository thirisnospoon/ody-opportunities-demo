// hooks/useCompanies.js
import { useEffect, useMemo, useState } from "react";

function uniqSorted(arr) {
    return Array.from(new Set(arr)).sort((a, b) => String(a).localeCompare(String(b)));
}

function extractFacets(companies) {
    const industries = [];
    const countries = [];

    (companies || []).forEach((c) => {
        (c.industries || []).forEach((i) => industries.push(i));
        (c.active_countries || []).forEach((ac) => {
            if (ac?.country_name) countries.push(ac.country_name);
        });
    });

    return {
        industries: uniqSorted(industries),
        countries: uniqSorted(countries),
    };
}

export default function useCompanies(src) {
    const [data, setData] = useState([]);
    const [facets, setFacets] = useState({ industries: [], countries: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(src, { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status} @ ${src}`);
                const json = await res.json();
                const list = Array.isArray(json) ? json : [];
                if (!active) return;
                setData(list);
                setFacets(extractFacets(list));
            } catch (e) {
                if (!active) return;
                setError(e.message || String(e));
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [src]);

    const memoFacets = useMemo(() => facets, [facets]);
    return { data, facets: memoFacets, loading, error };
}
