// pages/CompaniesPage.jsx
import React, { useMemo, useState } from "react";
import { Box, CircularProgress, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import useCompanies from "../hooks/useCompanies.js";
import CompaniesToolbar from "../components/CompaniesToolbar.jsx";
import CompaniesFiltersDrawer from "../components/CompaniesFiltersDrawer.jsx";
import CompanyCard from "../components/CompanyCard.jsx";
import CompanyDialog from "../components/CompanyDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PaginationBar from "../components/PaginationBar.jsx";
import { applyCompanyFilters } from "../utils/companyFilters.js";

const PER_PAGE = 12;

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, when: "beforeChildren" } },
};

export default function CompaniesPage({ src = "/data/out_companies.json" }) {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

    const { data, facets, loading, error } = useCompanies(src);

    const [search, setSearch] = useState("");
    const [industries, setIndustries] = useState([]);
    const [countries, setCountries] = useState([]);
    const [sortBy, setSortBy] = useState("name_asc");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const filtered = useMemo(
        () =>
            applyCompanyFilters(data, {
                search,
                industries,
                countries,
                sortBy,
            }),
        [data, search, industries, countries, sortBy]
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const pageSafe = Math.min(page, totalPages);
    const pageStart = (pageSafe - 1) * PER_PAGE;
    const paged = useMemo(() => filtered.slice(pageStart, pageStart + PER_PAGE), [filtered, pageStart]);

    const anyFilters = industries.length > 0 || countries.length > 0;

    return (
        <Stack spacing={2} sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
            <CompaniesToolbar
                search={search}
                onSearch={(v) => {
                    setSearch(v);
                    setPage(1);
                }}
                sortBy={sortBy}
                onSortBy={(v) => {
                    setSortBy(v);
                    setPage(1);
                }}
                showFiltersButton={!isMdUp}
                onOpenFilters={() => setFiltersOpen(true)}
                total={total}
            />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "320px 1fr", lg: "360px 1fr" },
                    columnGap: 2,
                    rowGap: 2,
                    alignItems: "start",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                }}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {isMdUp && (
                    <Box sx={{ gridColumn: "1", minWidth: 0, maxWidth: "100%" }}>
                        <CompaniesFiltersDrawer
                            permanent
                            facets={facets}
                            selected={{ industries, countries }}
                            onChange={{
                                industries: (v) => {
                                    setIndustries(v);
                                    setPage(1);
                                },
                                countries: (v) => {
                                    setCountries(v);
                                    setPage(1);
                                },
                            }}
                        />
                    </Box>
                )}

                <Box sx={{ gridColumn: { xs: "1", md: "2" }, minWidth: 0, maxWidth: "100%" }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={6}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <EmptyState title="Could not load companies" subtitle={String(error)} />
                    ) : total === 0 ? (
                        <EmptyState
                            title={anyFilters || search ? "No companies match" : "Nothing to show yet"}
                            subtitle={anyFilters || search ? "Try adjusting your filters or search terms." : "Add data to out_companies.json."}
                        />
                    ) : (
                        <>
                            {/* Рівно 2 картки в ряд на ≥ sm */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "minmax(0, 1fr)",
                                        sm: "repeat(2, minmax(0, 1fr))",
                                    },
                                    gap: 2,
                                    minWidth: 0,
                                    maxWidth: "100%",
                                }}
                            >
                                {paged.map((company, idx) => (
                                    <CompanyCard
                                        key={`${company.company_full_name || company.company_short_name}-${idx}`}
                                        company={company}
                                        onOpen={() => setSelectedCompany(company)}
                                    />
                                ))}
                            </Box>

                            <Box mt={2}>
                                <PaginationBar
                                    page={pageSafe}
                                    onPageChange={setPage}
                                    count={totalPages}
                                    perPage={PER_PAGE}
                                    onPerPageChange={() => {}}
                                    perPageOptions={[PER_PAGE]}
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </Box>

            {!isMdUp && (
                <CompaniesFiltersDrawer
                    open={filtersOpen}
                    onClose={() => setFiltersOpen(false)}
                    facets={facets}
                    selected={{ industries, countries }}
                    onChange={{
                        industries: (v) => {
                            setIndustries(v);
                            setPage(1);
                        },
                        countries: (v) => {
                            setCountries(v);
                            setPage(1);
                        },
                    }}
                />
            )}

            <CompanyDialog open={Boolean(selectedCompany)} company={selectedCompany} onClose={() => setSelectedCompany(null)} />
        </Stack>
    );
}
