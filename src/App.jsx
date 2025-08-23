import React, { useEffect, useMemo, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Paper,
    CircularProgress,
    Stack,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import IndustryTabs from "./components/IndustryTabs.jsx";
import OpportunitiesToolbar from "./components/OpportunitiesToolbar.jsx";
import FiltersDrawer from "./components/FiltersDrawer.jsx";
import OpportunityCard from "./components/OpportunityCard.jsx";
import PaginationBar from "./components/PaginationBar.jsx";
import EmptyState from "./components/EmptyState.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ActiveFiltersBar from "./components/ActiveFiltersBar.jsx";

import useOpportunities from "./hooks/useOpportunities.js";
import { applyFiltersAndSort } from "./utils/filters.js";

const ITEMS_PER_PAGE_DEFAULT = 12;

export default function App() {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

    // Using folder support (can also be a single json or array per previous update)
    const { data, loading, error, facets } = useOpportunities("/data");

    // UI state
    const [search, setSearch] = useState("");
    const [tabIndustry, setTabIndustry] = useState("All");
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedMentioned, setSelectedMentioned] = useState([]);
    const [selectedOrigins, setSelectedOrigins] = useState([]);

    // New filters from the previous iteration
    const [selectedAiModels, setSelectedAiModels] = useState([]);
    const [selectedAiTypes, setSelectedAiTypes] = useState([]);
    const [markRange, setMarkRange] = useState([0, 10]);

    const [sortBy, setSortBy] = useState("year_desc");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        if (facets?.marksRange) setMarkRange(facets.marksRange);
    }, [facets?.marksRange?.[0], facets?.marksRange?.[1]]);

    const marksDirty =
        Array.isArray(markRange) &&
        Array.isArray(facets?.marksRange) &&
        (markRange[0] !== facets.marksRange[0] || markRange[1] !== facets.marksRange[1]);

    // Filtering + sorting
    const filtered = useMemo(() => {
        const filters = {
            search,
            industryTab: tabIndustry,
            tags: selectedTags,
            years: selectedYears,
            companies: selectedCompanies,
            mentioned: selectedMentioned,
            origins: selectedOrigins,
            aiModels: selectedAiModels,
            aiTypes: selectedAiTypes,
            marksRange: markRange,
            strictMark: marksDirty,
            sortBy,
        };
        return applyFiltersAndSort(data, filters);
    }, [
        data,
        search,
        tabIndustry,
        selectedTags,
        selectedYears,
        selectedCompanies,
        selectedMentioned,
        selectedOrigins,
        selectedAiModels,
        selectedAiTypes,
        markRange,
        marksDirty,
        sortBy,
    ]);

    // Tab counts
    const tabCounts = useMemo(() => {
        const filtersExceptTab = {
            search,
            industryTab: "All",
            tags: selectedTags,
            years: selectedYears,
            companies: selectedCompanies,
            mentioned: selectedMentioned,
            origins: selectedOrigins,
            aiModels: selectedAiModels,
            aiTypes: selectedAiTypes,
            marksRange: markRange,
            strictMark: marksDirty,
            sortBy,
        };
        const pool = applyFiltersAndSort(data, filtersExceptTab);
        const counts = { All: pool.length };
        facets.industries.forEach((ind) => {
            counts[ind] = pool.filter((o) => (o.industry || []).includes(ind)).length;
        });
        return counts;
    }, [
        data,
        facets.industries,
        search,
        selectedTags,
        selectedYears,
        selectedCompanies,
        selectedMentioned,
        selectedOrigins,
        selectedAiModels,
        selectedAiTypes,
        markRange,
        marksDirty,
        sortBy,
    ]);

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const pageSafe = Math.min(page, totalPages);
    const paged = useMemo(() => {
        const start = (pageSafe - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, pageSafe, perPage]);

    useEffect(() => {
        setPage(1);
    }, [
        search,
        tabIndustry,
        selectedTags,
        selectedYears,
        selectedCompanies,
        selectedMentioned,
        selectedOrigins,
        selectedAiModels,
        selectedAiTypes,
        markRange,
        sortBy,
    ]);

    const anyFilters =
        [
            selectedTags,
            selectedYears,
            selectedCompanies,
            selectedMentioned,
            selectedOrigins,
            selectedAiModels,
            selectedAiTypes,
        ].some((arr) => (arr || []).length > 0) || marksDirty;

    return (
        <Box>
            <AppBar position="sticky" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Opportunities Explorer
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: { xs: 1.25, md: 2 } }}>
                <Stack spacing={2}>
                    <Paper variant="outlined">
                        <IndustryTabs
                            industries={facets.industries}
                            counts={tabCounts}
                            value={tabIndustry}
                            onChange={setTabIndustry}
                        />
                    </Paper>

                    {isMdUp ? (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { md: "360px 1fr" },
                                gap: 2,
                            }}
                        >
                            {/* Left: filters (sticky) */}
                            <Box>
                                <FiltersDrawer
                                    permanent
                                    width={{ md: 360 }}
                                    facets={facets}
                                    selected={{
                                        tags: selectedTags,
                                        years: selectedYears,
                                        companies: selectedCompanies,
                                        mentioned: selectedMentioned,
                                        origins: selectedOrigins,
                                        aiModels: selectedAiModels,
                                        aiTypes: selectedAiTypes,
                                        marksRange: markRange,
                                    }}
                                    onChange={{
                                        tags: setSelectedTags,
                                        years: setSelectedYears,
                                        companies: setSelectedCompanies,
                                        mentioned: setSelectedMentioned,
                                        origins: setSelectedOrigins,
                                        aiModels: setSelectedAiModels,
                                        aiTypes: setSelectedAiTypes,
                                        marksRange: setMarkRange,
                                    }}
                                    onResetMarks={() => setMarkRange(facets.marksRange)}
                                />
                            </Box>

                            {/* Right: content list - NOW single column (one card per row) */}
                            <Box>
                                <OpportunitiesToolbar
                                    search={search}
                                    onSearch={setSearch}
                                    sortBy={sortBy}
                                    onSortBy={setSortBy}
                                />

                                <StatsBar
                                    total={total}
                                    uniqueCompanies={new Set(filtered.map((o) => o.company_name)).size}
                                    yearsRange={facets.years}
                                    avgMark={
                                        filtered.length
                                            ? (
                                                filtered
                                                    .map((o) =>
                                                        typeof o.opportunity_mark === "number"
                                                            ? o.opportunity_mark
                                                            : null
                                                    )
                                                    .filter((v) => v !== null)
                                                    .reduce((a, b) => a + b, 0) /
                                                Math.max(
                                                    1,
                                                    filtered.filter(
                                                        (o) => typeof o.opportunity_mark === "number"
                                                    ).length
                                                )
                                            ).toFixed(1)
                                            : null
                                    }
                                    aiModelsCount={new Set(filtered.map((o) => o.ai_model).filter(Boolean)).size}
                                />

                                {loading ? (
                                    <Box display="flex" justifyContent="center" py={6}>
                                        <CircularProgress />
                                    </Box>
                                ) : error ? (
                                    <EmptyState title="Could not load data" subtitle={String(error)} />
                                ) : total === 0 ? (
                                    <EmptyState
                                        title="No matches"
                                        subtitle="Try adjusting your filters or search terms."
                                    />
                                ) : (
                                    <>
                                        {/* SINGLE COLUMN on desktop */}
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr",
                                                gap: 2,
                                            }}
                                        >
                                            {paged.map((item, idx) => (
                                                <Box key={`${item.title}-${idx}`} sx={{ width: "100%" }}>
                                                    <OpportunityCard item={item} />
                                                </Box>
                                            ))}
                                        </Box>

                                        <Box mt={2}>
                                            <PaginationBar
                                                page={pageSafe}
                                                onPageChange={setPage}
                                                count={totalPages}
                                                perPage={perPage}
                                                onPerPageChange={setPerPage}
                                                perPageOptions={[8, 12, 24, 48]}
                                            />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        // Mobile stays single column as before
                        <Box>
                            <OpportunitiesToolbar
                                search={search}
                                onSearch={setSearch}
                                sortBy={sortBy}
                                onSortBy={setSortBy}
                                showFiltersButton
                                onOpenFilters={() => setFiltersOpen(true)}
                            />

                            {anyFilters && (
                                <ActiveFiltersBar
                                    selected={{
                                        tags: selectedTags,
                                        years: selectedYears,
                                        companies: selectedCompanies,
                                        mentioned: selectedMentioned,
                                        origins: selectedOrigins,
                                        aiModels: selectedAiModels,
                                        aiTypes: selectedAiTypes,
                                        marksRange: markRange,
                                        defaultMarksRange: facets.marksRange,
                                    }}
                                    onChange={{
                                        tags: setSelectedTags,
                                        years: setSelectedYears,
                                        companies: setSelectedCompanies,
                                        mentioned: setSelectedMentioned,
                                        origins: setSelectedOrigins,
                                        aiModels: setSelectedAiModels,
                                        aiTypes: setSelectedAiTypes,
                                        marksRange: setMarkRange,
                                    }}
                                    onResetMarks={() => setMarkRange(facets.marksRange)}
                                />
                            )}

                            <StatsBar
                                total={total}
                                uniqueCompanies={new Set(filtered.map((o) => o.company_name)).size}
                                yearsRange={facets.years}
                                avgMark={
                                    filtered.length
                                        ? (
                                            filtered
                                                .map((o) =>
                                                    typeof o.opportunity_mark === "number"
                                                        ? o.opportunity_mark
                                                        : null
                                                )
                                                .filter((v) => v !== null)
                                                .reduce((a, b) => a + b, 0) /
                                            Math.max(
                                                1,
                                                filtered.filter(
                                                    (o) => typeof o.opportunity_mark === "number"
                                                ).length
                                            )
                                        ).toFixed(1)
                                        : null
                                }
                                aiModelsCount={new Set(filtered.map((o) => o.ai_model).filter(Boolean)).size}
                            />

                            {loading ? (
                                <Box display="flex" justifyContent="center" py={6}>
                                    <CircularProgress />
                                </Box>
                            ) : error ? (
                                <EmptyState title="Could not load data" subtitle={String(error)} />
                            ) : total === 0 ? (
                                <EmptyState title="No matches" subtitle="Try adjusting your filters or search terms." />
                            ) : (
                                <>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                                        {paged.map((item, idx) => (
                                            <Box key={`${item.title}-${idx}`} sx={{ width: "100%" }}>
                                                <OpportunityCard item={item} />
                                            </Box>
                                        ))}
                                    </Box>

                                    <Box mt={2}>
                                        <PaginationBar
                                            page={pageSafe}
                                            onPageChange={setPage}
                                            count={totalPages}
                                            perPage={perPage}
                                            onPerPageChange={setPerPage}
                                            perPageOptions={[8, 12, 24, 48]}
                                        />
                                    </Box>
                                </>
                            )}

                            <FiltersDrawer
                                open={filtersOpen}
                                onClose={() => setFiltersOpen(false)}
                                facets={facets}
                                selected={{
                                    tags: selectedTags,
                                    years: selectedYears,
                                    companies: selectedCompanies,
                                    mentioned: selectedMentioned,
                                    origins: selectedOrigins,
                                    aiModels: selectedAiModels,
                                    aiTypes: selectedAiTypes,
                                    marksRange: markRange,
                                }}
                                onChange={{
                                    tags: setSelectedTags,
                                    years: setSelectedYears,
                                    companies: setSelectedCompanies,
                                    mentioned: setSelectedMentioned,
                                    origins: setSelectedOrigins,
                                    aiModels: setSelectedAiModels,
                                    aiTypes: setSelectedAiTypes,
                                    marksRange: setMarkRange,
                                }}
                                onResetMarks={() => setMarkRange(facets.marksRange)}
                            />
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
