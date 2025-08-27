// App.jsx  (UPDATED)
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
import EventsToolbar from "./components/EventsToolbar.jsx";
import FiltersDrawer from "./components/FiltersDrawer.jsx";
import EventCard from "./components/EventCard.jsx";
import PaginationBar from "./components/PaginationBar.jsx";
import EmptyState from "./components/EmptyState.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ActiveFiltersBar from "./components/ActiveFiltersBar.jsx";
import EventDialog from "./components/EventDialog.jsx";

import useEvents from "./hooks/useEvents.js";
import { applyEventFiltersAndSort } from "./utils/filters.js";

const ITEMS_PER_PAGE_DEFAULT = 12;

export default function App() {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

    // Using folder support (can also be a single json or array per previous update)
    const { data, loading, error, facets } = useEvents("/data");

    // UI state
    const [search, setSearch] = useState("");
    const [tabIndustry, setTabIndustry] = useState("All");
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedMentioned, setSelectedMentioned] = useState([]);
    const [selectedOrigins, setSelectedOrigins] = useState([]);

    // AI filters
    const [selectedAiModels, setSelectedAiModels] = useState([]);
    const [selectedAiTypes, setSelectedAiTypes] = useState([]);

    const [sortBy, setSortBy] = useState("year_desc");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Dialog state
    const [selectedEvent, setSelectedEvent] = useState(null);

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
            sortBy,
        };
        return applyEventFiltersAndSort(data, filters);
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
            sortBy,
        };
        const pool = applyEventFiltersAndSort(data, filtersExceptTab);
        const counts = { All: pool.length };
        (facets?.industries || []).forEach((ind) => {
            counts[ind] = pool.filter((o) => (o.industry || []).includes(ind)).length;
        });
        return counts;
    }, [
        data,
        facets?.industries,
        search,
        selectedTags,
        selectedYears,
        selectedCompanies,
        selectedMentioned,
        selectedOrigins,
        selectedAiModels,
        selectedAiTypes,
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

    // Reset page on filter changes
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
        sortBy,
    ]);

    const anyFilters = [
        selectedTags,
        selectedYears,
        selectedCompanies,
        selectedMentioned,
        selectedOrigins,
        selectedAiModels,
        selectedAiTypes,
    ].some((arr) => (arr || []).length > 0);

    const openDialog = (ev) => setSelectedEvent(ev);
    const closeDialog = () => setSelectedEvent(null);

    return (
        <Box>
            <AppBar position="sticky" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Events Explorer
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
                                    }}
                                    onChange={{
                                        tags: setSelectedTags,
                                        years: setSelectedYears,
                                        companies: setSelectedCompanies,
                                        mentioned: setSelectedMentioned,
                                        origins: setSelectedOrigins,
                                        aiModels: setSelectedAiModels,
                                        aiTypes: setSelectedAiTypes,
                                    }}
                                />
                            </Box>

                            {/* Right: content list - single column */}
                            <Box>
                                <EventsToolbar
                                    search={search}
                                    onSearch={setSearch}
                                    sortBy={sortBy}
                                    onSortBy={setSortBy}
                                />

                                <StatsBar
                                    total={total}
                                    uniqueCompanies={
                                        new Set(filtered.map((o) => o.company_name).filter(Boolean)).size
                                    }
                                    yearsRange={facets.years}
                                    aiModelsCount={
                                        new Set(filtered.map((o) => o.ai_model).filter(Boolean)).size
                                    }
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
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr",
                                                gap: 2,
                                            }}
                                        >
                                            {paged.map((item, idx) => (
                                                <Box key={`${item.title}-${idx}`} sx={{ width: "100%" }}>
                                                    <EventCard item={item} onOpen={() => openDialog(item)} />
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
                        // Mobile (single column + bottom-sheet filters)
                        <Box>
                            <EventsToolbar
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
                                    }}
                                    onChange={{
                                        tags: setSelectedTags,
                                        years: setSelectedYears,
                                        companies: setSelectedCompanies,
                                        mentioned: setSelectedMentioned,
                                        origins: setSelectedOrigins,
                                        aiModels: setSelectedAiModels,
                                        aiTypes: setSelectedAiTypes,
                                    }}
                                />
                            )}

                            <StatsBar
                                total={total}
                                uniqueCompanies={
                                    new Set(filtered.map((o) => o.company_name).filter(Boolean)).size
                                }
                                yearsRange={facets.years}
                                aiModelsCount={
                                    new Set(filtered.map((o) => o.ai_model).filter(Boolean)).size
                                }
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
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                                        {paged.map((item, idx) => (
                                            <Box key={`${item.title}-${idx}`} sx={{ width: "100%" }}>
                                                <EventCard item={item} onOpen={() => openDialog(item)} />
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
                                }}
                                onChange={{
                                    tags: setSelectedTags,
                                    years: setSelectedYears,
                                    companies: setSelectedCompanies,
                                    mentioned: setSelectedMentioned,
                                    origins: setSelectedOrigins,
                                    aiModels: setSelectedAiModels,
                                    aiTypes: setSelectedAiTypes,
                                }}
                            />
                        </Box>
                    )}
                </Stack>
            </Container>

            {/* Details dialog */}
            <EventDialog open={Boolean(selectedEvent)} event={selectedEvent} onClose={closeDialog} />
        </Box>
    );
}
