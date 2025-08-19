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

    const { data, loading, error, facets } = useOpportunities("/data.json");

    // UI state
    const [search, setSearch] = useState("");
    const [tabIndustry, setTabIndustry] = useState("All");
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedMentioned, setSelectedMentioned] = useState([]);
    const [selectedOrigins, setSelectedOrigins] = useState([]);
    const [sortBy, setSortBy] = useState("year_desc");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);
    const [filtersOpen, setFiltersOpen] = useState(false); // mobile bottom sheet

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
        sortBy,
    ]);

    // Tab counts (respect filters except the tab itself)
    const tabCounts = useMemo(() => {
        const filtersExceptTab = {
            search,
            industryTab: "All",
            tags: selectedTags,
            years: selectedYears,
            companies: selectedCompanies,
            mentioned: selectedMentioned,
            origins: selectedOrigins,
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
    }, [search, tabIndustry, selectedTags, selectedYears, selectedCompanies, selectedMentioned, selectedOrigins, sortBy]);

    // FIX: ensure boolean (prevents rendering a stray 0)
    const anyFilters = [selectedTags, selectedYears, selectedCompanies, selectedMentioned, selectedOrigins]
        .some(arr => arr.length > 0);

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
                                    }}
                                    onChange={{
                                        tags: setSelectedTags,
                                        years: setSelectedYears,
                                        companies: setSelectedCompanies,
                                        mentioned: setSelectedMentioned,
                                        origins: setSelectedOrigins,
                                    }}
                                />
                            </Box>

                            <Box>
                                <OpportunitiesToolbar
                                    search={search}
                                    onSearch={setSearch}
                                    sortBy={sortBy}
                                    onSortBy={setSortBy}
                                    showFiltersButton={false}
                                    onOpenFilters={() => {}}
                                />

                                <StatsBar
                                    total={total}
                                    uniqueCompanies={new Set(filtered.map((o) => o.company_name)).size}
                                    yearsRange={facets.years}
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
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: {
                                                    xs: "1fr",
                                                    sm: "repeat(auto-fill, 320px)",
                                                    md: "repeat(auto-fill, 340px)",
                                                },
                                                gap: 2,
                                                justifyContent: { xs: "stretch", sm: "start" },
                                            }}
                                        >
                                            {paged.map((item, idx) => (
                                                <Box key={`${item.title}-${idx}`} sx={{ width: { xs: "100%", sm: 320, md: 340 } }}>
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
                                    }}
                                    onChange={{
                                        tags: setSelectedTags,
                                        years: setSelectedYears,
                                        companies: setSelectedCompanies,
                                        mentioned: setSelectedMentioned,
                                        origins: setSelectedOrigins,
                                    }}
                                />
                            )}

                            <StatsBar
                                total={total}
                                uniqueCompanies={new Set(filtered.map((o) => o.company_name)).size}
                                yearsRange={facets.years}
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
                                }}
                                onChange={{
                                    tags: setSelectedTags,
                                    years: setSelectedYears,
                                    companies: setSelectedCompanies,
                                    mentioned: setSelectedMentioned,
                                    origins: setSelectedOrigins,
                                }}
                            />
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
