// components/CompanyOpportunitiesDialog.jsx
// Master list dialog — opens a separate OpportunityDetailDialog on click

import React, { useMemo, useState, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Stack,
    Box,
    Typography,
    Chip,
    TextField,
    InputAdornment,
    ToggleButtonGroup,
    ToggleButton,
    Grid,
    Card,
    CardContent,
    Tooltip,
    Button,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import TagIcon from "@mui/icons-material/Tag";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import { AnimatePresence, motion } from "framer-motion";
import OpportunityDetailDialog from "./OpportunityDetailDialog.jsx";

/* Small atoms */
function SoftCard({ children, sx }) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                borderColor: (t) => t.palette.divider,
                bgcolor: (t) =>
                    t.palette.mode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                transition: "transform .18s ease, box-shadow .18s ease",
                "&:hover": { transform: "translateY(-1px)", boxShadow: 2 },
                ...sx,
            }}
            component={motion.div}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>{children}</CardContent>
        </Card>
    );
}

function PillStat({ icon: Icon, label, value }) {
    return (
        <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
                px: 1.25,
                py: 0.75,
                borderRadius: 999,
                bgcolor: (t) => (t.palette.mode === "light" ? t.palette.grey[100] : t.palette.grey[900]),
                border: (t) => `1px solid ${t.palette.divider}`,
                minHeight: 34,
            }}
        >
            <Icon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.25 }}>
                {value}
            </Typography>
        </Stack>
    );
}

function ScoreRing({ value = 0, size = 44 }) {
    const clamped = Math.max(0, Math.min(10, Number(value) || 0));
    const pct = (clamped / 10) * 100;
    return (
        <Box sx={{ position: "relative", width: size, height: size }}>
            <svg viewBox="0 0 36 36" width={size} height={size}>
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="3"
                />
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="3"
                    strokeDasharray={`${pct}, 100`}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFAB40" />
                        <stop offset="100%" stopColor="#00BCD4" />
                    </linearGradient>
                </defs>
            </svg>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                }}
            >
                {clamped}
            </Box>
        </Box>
    );
}

export default function CompanyOpportunitiesDialog({
                                                       open,
                                                       onClose,
                                                       company,
                                                       opportunities = [],
                                                   }) {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("score_desc");
    const [activeTags, setActiveTags] = useState([]);
    const [detailOpen, setDetailOpen] = useState(false);
    const [activeOp, setActiveOp] = useState(null);

    const allTags = useMemo(() => {
        const s = new Set();
        (opportunities || []).forEach((o) => (o.tags || []).forEach((t) => s.add(t)));
        return Array.from(s).sort((a, b) => a.localeCompare(b));
    }, [opportunities]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = Array.isArray(opportunities) ? [...opportunities] : [];
        if (q) {
            list = list.filter((o) => {
                const hay = [
                    o.title,
                    o.description,
                    ...(o.tags || []),
                    ...(o.companies_mentioned || []),
                    o.value,
                    o.uuid || "",
                ]
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q);
            });
        }
        if (activeTags.length)
            list = list.filter((o) => activeTags.every((t) => (o.tags || []).includes(t)));
        switch (sortBy) {
            case "score_desc":
                list.sort((a, b) => (b.possibility_mark || 0) - (a.possibility_mark || 0));
                break;
            case "score_asc":
                list.sort((a, b) => (a.possibility_mark || 0) - (b.possibility_mark || 0));
                break;
            case "title_asc":
                list.sort((a, b) =>
                    String(a.title || "").localeCompare(String(b.title || ""))
                );
                break;
            case "title_desc":
                list.sort((a, b) =>
                    String(b.title || "").localeCompare(String(a.title || ""))
                );
                break;
        }
        return list;
    }, [opportunities, query, sortBy, activeTags]);

    const toggleTag = useCallback(
        (t) =>
            setActiveTags((prev) =>
                prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
            ),
        []
    );
    const clearFilters = useCallback(() => {
        setQuery("");
        setActiveTags([]);
    }, []);
    const openDetail = useCallback((op) => {
        setActiveOp(op);
        setDetailOpen(true);
    }, []);

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="lg"
                fullScreen={isSmDown}
                scroll="paper"
                aria-labelledby="company-opportunities-title"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: isSmDown ? 0 : 3,
                            overflow: "hidden",
                            maxHeight: isSmDown ? "100dvh" : "92dvh",
                        },
                    },
                }}
            >
                <DialogTitle
                    id="company-opportunities-title"
                    sx={{
                        p: { xs: 1.25, sm: 2, md: 2.5 },
                        pb: { xs: 1, sm: 1.5 },
                        borderBottom: (t) => `1px solid ${t.palette.divider}`,
                        background:
                            "linear-gradient(90deg, rgba(255,171,64,0.12) 0%, rgba(0,188,212,0.12) 100%)",
                        position: "sticky",
                        top: 0,
                        zIndex: 3,
                    }}
                    component={motion.div}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant={isSmDown ? "subtitle1" : "h6"}
                                sx={{ fontWeight: 800, lineHeight: 1.2 }}
                            >
                                Opportunities —{" "}
                                {company?.company_full_name ||
                                    company?.company_short_name ||
                                    "Company"}
                            </Typography>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                sx={{ mt: 1, alignItems: { xs: "stretch", sm: "center" } }}
                            >
                                <TextField
                                    size="small"
                                    placeholder="Search in opportunities…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ flex: 1, minWidth: 240 }}
                                />
                                <ToggleButtonGroup
                                    size="small"
                                    value={sortBy}
                                    exclusive
                                    onChange={(_, v) => v && setSortBy(v)}
                                    sx={{
                                        flexWrap: "wrap",
                                        "& .MuiToggleButton-root": { borderRadius: 999 },
                                    }}
                                >
                                    <ToggleButton value="score_desc">Score ⬇</ToggleButton>
                                    <ToggleButton value="score_asc">Score ⬆</ToggleButton>
                                    <ToggleButton value="title_asc">Title A–Z</ToggleButton>
                                    <ToggleButton value="title_desc">Title Z–A</ToggleButton>
                                </ToggleButtonGroup>
                                <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
                                    <PillStat
                                        icon={PlaylistAddCheckIcon}
                                        label="Total"
                                        value={String(opportunities.length)}
                                    />
                                    <PillStat
                                        icon={InsightsOutlinedIcon}
                                        label="Shown"
                                        value={String(filtered.length)}
                                    />
                                </Stack>
                            </Stack>
                            {/* Active tag filters */}
                            {activeTags.length ? (
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.5 }}
                                >
                                    {activeTags.map((t) => (
                                        <Chip
                                            key={t}
                                            size="small"
                                            label={t}
                                            onDelete={() => toggleTag(t)}
                                            color="primary"
                                        />
                                    ))}
                                    <Button
                                        size="small"
                                        onClick={clearFilters}
                                        startIcon={<FilterAltRoundedIcon />}
                                    >
                                        Clear filters
                                    </Button>
                                </Stack>
                            ) : null}
                        </Stack>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 1.25, sm: 1.75, md: 2 } }}>
                    {/* Tag cloud */}
                    {allTags.length ? (
                        <SoftCard sx={{ mb: 1.25 }}>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 0.5 }}
                            >
                                <TuneRoundedIcon fontSize="small" />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    Filter by Tags
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={0.75}
                                sx={{ flexWrap: "wrap", rowGap: 0.5 }}
                            >
                                {allTags.slice(0, 40).map((t) => {
                                    const active = activeTags.includes(t);
                                    return (
                                        <Chip
                                            key={t}
                                            size="small"
                                            label={t}
                                            icon={<TagIcon />}
                                            color={active ? "primary" : "default"}
                                            variant={active ? "filled" : "outlined"}
                                            onClick={() => toggleTag(t)}
                                            sx={{ cursor: "pointer" }}
                                        />
                                    );
                                })}
                                {allTags.length > 40 && (
                                    <Chip
                                        size="small"
                                        label={`+${allTags.length - 40}`}
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </SoftCard>
                    ) : null}

                    {/* List */}
                    {filtered.length === 0 ? (
                        <SoftCard>
                            <Typography variant="body2" color="text.secondary">
                                No opportunities match your filters. Try clearing the search or
                                changing sort.
                            </Typography>
                        </SoftCard>
                    ) : (
                        <Grid container spacing={1.25}>
                            <AnimatePresence initial={false}>
                                {filtered.map((op, idx) => (
                                    <Grid
                                        key={op.uuid || `${op.title}-${idx}`}
                                        item
                                        xs={12}
                                        md={12}
                                        component={motion.div}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card
                                            variant="outlined"
                                            onClick={() => openDetail(op)}
                                            sx={{
                                                borderRadius: 3,
                                                overflow: "hidden",
                                                borderColor: (t) => t.palette.divider,
                                                "&:hover": { boxShadow: 3, transform: "translateY(-2px)" },
                                                transition: "box-shadow .18s ease, transform .18s ease",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    height: 6,
                                                    background:
                                                        "linear-gradient(90deg, #FFAB40 0%, #00BCD4 100%)",
                                                }}
                                            />
                                            <CardContent sx={{ p: { xs: 1.25, sm: 1.75 } }}>
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <ScoreRing value={op.possibility_mark} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                            sx={{ mb: 0.5, minWidth: 0 }}
                                                        >
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 800,
                                                                    lineHeight: 1.2,
                                                                    wordBreak: "break-word",
                                                                    overflowWrap: "anywhere",
                                                                }}
                                                            >
                                                                {op.title || "Opportunity"}
                                                            </Typography>
                                                            {op.uuid && (
                                                                <Tooltip title="Copy UUID">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigator.clipboard?.writeText(op.uuid);
                                                                        }}
                                                                    >
                                                                        <ContentCopyIcon fontSize="inherit" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                        {op.description && (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    whiteSpace: "pre-wrap",
                                                                    mb: 1,
                                                                    maxHeight: 76,
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                {op.description}
                                                            </Typography>
                                                        )}
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                            sx={{ flexWrap: "wrap", rowGap: 0.5, mb: 1 }}
                                                        >
                                                            {(op.tags || [])
                                                                .slice(0, 8)
                                                                .map((t) => (
                                                                    <Chip
                                                                        key={t}
                                                                        size="small"
                                                                        icon={<LocalOfferIcon />}
                                                                        label={t}
                                                                        variant="outlined"
                                                                    />
                                                                ))}
                                                            {(op.tags || []).length > 8 && (
                                                                <Chip
                                                                    size="small"
                                                                    label={`+${(op.tags || []).length - 8}`}
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Stack>
                                                        {!!(op.companies_mentioned || []).length && (
                                                            <Stack
                                                                direction="row"
                                                                spacing={0.5}
                                                                sx={{ flexWrap: "wrap", rowGap: 0.5, mb: 0.5 }}
                                                            >
                                                                {(op.companies_mentioned || [])
                                                                    .slice(0, 6)
                                                                    .map((cm) => (
                                                                        <Chip
                                                                            key={cm}
                                                                            size="small"
                                                                            icon={<BusinessOutlinedIcon />}
                                                                            label={cm}
                                                                            variant="outlined"
                                                                        />
                                                                    ))}
                                                            </Stack>
                                                        )}
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            sx={{ justifyContent: "flex-end" }}
                                                        >
                                                            {op.uuid && (
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<ContentCopyIcon />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard?.writeText(op.uuid);
                                                                    }}
                                                                    sx={{ borderRadius: 999 }}
                                                                >
                                                                    Copy UUID
                                                                </Button>
                                                            )}
                                                            {op.tags?.length ? (
                                                                <Chip
                                                                    size="small"
                                                                    icon={<TagIcon />}
                                                                    label={`${op.tags.length} tags`}
                                                                />
                                                            ) : null}
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>

            {/* Separate Detail Dialog */}
            <OpportunityDetailDialog
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                opportunity={activeOp}
                companyName={
                    company?.company_full_name || company?.company_short_name || "Company"
                }
            />
        </>
    );
}
