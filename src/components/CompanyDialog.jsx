// components/CompanyDialog.jsx
import React, { forwardRef, useMemo, useRef, useState } from "react";
import {
    Dialog,
    Slide,
    Box,
    IconButton,
    Typography,
    Stack,
    Chip,
    Divider,
    Grid,
    Card,
    CardContent,
    Button,
    Tooltip,
    DialogTitle,
    DialogContent,
    useMediaQuery,
    Paper,
    Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PublicIcon from "@mui/icons-material/Public";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TagIcon from "@mui/icons-material/Tag";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BusinessIcon from "@mui/icons-material/Business";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import LanguageIcon from "@mui/icons-material/Language";
import { motion, AnimatePresence } from "framer-motion";

// NOTE: Import 'flag-icons' CSS globally in your app entry:
// import 'flag-icons/css/flag-icons.min.css';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

/* ----------------- utils ----------------- */
const fadeUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
};

const noScrollbar = {
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": { display: "none" },
};

const safeArray = (v) => (Array.isArray(v) ? v : []);
function extractDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
}

/* -------- country/flag helpers (flag-icons) -------- */
const COUNTRY_TO_ISO = {
    Argentina: "AR",
    Azerbaijan: "AZ",
    Belarus: "BY",
    Egypt: "EG",
    India: "IN",
    Jordan: "JO",
    Kazakhstan: "KZ",
    Mauritius: "MU",
    Mexico: "MX",
    Morocco: "MA",
    Russia: "RU",
    Serbia: "RS",
    Seychelles: "SC",
    Syria: "SY",
    "The Netherlands": "NL",
    "United Arab Emirates": "AE",
    "United Kingdom": "GB",
    "United States": "US",
    "Gulf Cooperation Council (GCC) countries": ["AE", "SA", "KW", "QA", "OM", "BH"],
};

function expandToFlagCodes(countries = []) {
    const codes = [];
    countries.forEach((c) => {
        const iso = COUNTRY_TO_ISO[c?.country_name];
        if (!iso) return;
        if (Array.isArray(iso)) codes.push(...iso);
        else codes.push(iso);
    });
    // unique while preserving order
    return [...new Set(codes)];
}

function FlagIcon({ code, size = 14, radius = 0.5 }) {
    if (!code)
        return (
            <Box
                sx={{
                    width: Math.round((size * 4) / 3),
                    height: size,
                    borderRadius: radius,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <LanguageIcon fontSize="inherit" sx={{ fontSize: size * 0.7, opacity: 0.7 }} />
            </Box>
        );

    const w = Math.round((size * 4) / 3);
    return (
        <Box
            sx={{
                width: w,
                height: size,
                borderRadius: radius,
                overflow: "hidden",
                border: (t) => `1px solid ${t.palette.divider}`,
                lineHeight: 0,
                flex: "0 0 auto",
            }}
        >
            <Box
                component="span"
                className={`fi fi-${String(code).toLowerCase()}`}
                sx={{
                    "--fi-size": `${size}px`,
                    display: "block",
                    width: "100%",
                    height: "100%",
                }}
            />
        </Box>
    );
}

function CountryFlagsStrip({ countries, maxVisible = 18, size = 14 }) {
    const codes = expandToFlagCodes(countries);
    const visible = codes.slice(0, maxVisible);
    const rest = codes.length - visible.length;

    return (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
            {visible.map((c) => (
                <FlagIcon key={c} code={c} size={size} />
            ))}
            {rest > 0 && (
                <Chip
                    size="small"
                    label={`+${rest}`}
                    sx={{
                        height: size + 6,
                        borderRadius: 999,
                        px: 0.5,
                        "& .MuiChip-label": { px: 0.75, fontSize: 11 },
                    }}
                    variant="outlined"
                />
            )}
        </Stack>
    );
}

/* ----------------- atoms ----------------- */
function GradientBadge({ text = "", size = 56 }) {
    const letter = (text || "•").trim().charAt(0).toUpperCase();
    return (
        <Box
            sx={{
                width: size,
                height: size,
                minWidth: size,
                minHeight: size,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: Math.max(16, Math.round(size * 0.36)),
                background: "linear-gradient(135deg, #7C4DFF 0%, #00BCD4 100%)",
                boxShadow: 3,
            }}
            component={motion.div}
            {...fadeUp}
        >
            {letter}
        </Box>
    );
}

function SectionTitle({ icon, children }) {
    const Icon = icon || InfoOutlinedIcon;
    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            component={motion.div}
            {...fadeUp}
            sx={{ mb: 1 }}
        >
            <Icon fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.15 }}>
                {children}
            </Typography>
        </Stack>
    );
}

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
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>{children}</CardContent>
        </Card>
    );
}

function StatPill({ icon, label, value }) {
    const Icon = icon;
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
            component={motion.div}
            layout
        >
            <Icon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.25 }}>
                {value ?? "—"}
            </Typography>
        </Stack>
    );
}

function TimelineList({ items = [], primaryKey, secondaryKey }) {
    const list = safeArray(items);
    if (!list.length) return null;
    return (
        <Stack spacing={1.25} sx={{ position: "relative", pl: { xs: 3.5, sm: 4 } }}>
            <Box
                sx={{
                    position: "absolute",
                    left: { xs: 10, sm: 13 },
                    top: 6,
                    bottom: 6,
                    width: 2,
                    background:
                        "linear-gradient(180deg, rgba(124,77,255,0.35) 0%, rgba(0,188,212,0.35) 100%)",
                }}
            />
            <AnimatePresence initial={false}>
                {list.map((it, idx) => (
                    <Stack
                        key={`${it?.[primaryKey] ?? idx}-${idx}`}
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                        component={motion.div}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Box
                            sx={{
                                mt: 0.5,
                                width: { xs: 10, sm: 14 },
                                height: { xs: 10, sm: 14 },
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #7C4DFF 0%, #00BCD4 100%)",
                                boxShadow: 1,
                                flex: "0 0 auto",
                            }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, wordBreak: "break-word", overflowWrap: "anywhere" }}
                            >
                                {it?.[primaryKey] ?? "—"}
                            </Typography>
                            {it?.[secondaryKey] && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}
                                >
                                    {it[secondaryKey]}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                ))}
            </AnimatePresence>
        </Stack>
    );
}

/* ---------- truncate + hover expand ---------- */
function TruncateWithHover({ text = "", maxChars = 68, placement = "top-start" }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    if (!text) return null;

    const truncated = text.length <= maxChars ? text : `${text.slice(0, maxChars).trim()}…`;

    return (
        <>
            <Typography
                ref={anchorRef}
                variant="body2"
                color="text.secondary"
                sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    cursor: text.length > maxChars ? "help" : "default",
                    position: "relative",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                }}
                onMouseEnter={() => text.length > maxChars && setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {truncated}
            </Typography>

            <Fade in={open} timeout={120} unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        position: "fixed",
                        top: anchorRef.current
                            ? anchorRef.current.getBoundingClientRect().top - 8
                            : 0,
                        left: anchorRef.current
                            ? anchorRef.current.getBoundingClientRect().left
                            : 0,
                        transform: "translateY(-100%)",
                        maxWidth: 480,
                        p: 1.25,
                        borderRadius: 2,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        zIndex: 2000,
                    }}
                    onMouseLeave={() => setOpen(false)}
                >
                    <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {text}
                    </Typography>
                </Paper>
            </Fade>
        </>
    );
}

/* ----------------- main ----------------- */
export default function CompanyDialog({ open, company, onClose }) {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
    const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

    const c = company || {};
    const industries = safeArray(c.industries);
    const tags = safeArray(c.tags);
    const countries = safeArray(c.active_countries);
    const products = safeArray(c.products);
    const services = safeArray(c.services);
    const moves = safeArray(c.recent_moves);
    const partnerships = safeArray(c.partnerships);

    const siteDomain = extractDomain(c.company_website);

    const stats = useMemo(
        () => [
            { icon: CalendarMonthIcon, label: "Founded", value: c.founded || "—" },
            { icon: BusinessIcon, label: "Name", value: c.company_short_name || c.company_full_name || "—" },
            { icon: PublicIcon, label: "Countries", value: String(countries.length || 0) },
            { icon: Inventory2Icon, label: "Products", value: String(products.length || 0) },
            { icon: TagIcon, label: "Tags", value: String(tags.length || 0) },
        ],
        [c.founded, c.company_short_name, c.company_full_name, countries.length, products.length, tags.length]
    );

    // refs for in-page scroll
    const sectionRefs = {
        overview: useRef(null),
        products: useRef(null),
        services: useRef(null),
        countries: useRef(null),
        tags: useRef(null),
        moves: useRef(null),
        partnerships: useRef(null),
    };
    const scrollTo = (key) => {
        const el = sectionRefs[key]?.current;
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <Dialog
            fullWidth
            fullScreen={isSmDown}
            maxWidth="xl"
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            scroll="paper"
            aria-labelledby="company-dialog-title"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: isSmDown ? 0 : 3,
                        overflow: "hidden",
                        maxHeight: isSmDown ? "100dvh" : "90dvh",
                        height: isSmDown ? "100dvh" : "auto",
                        m: 0,
                        backdropFilter: "blur(4px)",
                    },
                },
            }}
        >
            <DialogTitle
                id="company-dialog-title"
                sx={{
                    p: { xs: 1.25, sm: 2, md: 2.5 },
                    pb: { xs: 1, sm: 1.5 },
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                    background:
                        "linear-gradient(90deg, rgba(80,70,255,0.10) 0%, rgba(0,188,212,0.10) 100%)",
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                }}
                component={motion.div}
                {...fadeUp}
            >
                {/* Row 1: logo + names + site + website button + close */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <GradientBadge
                        text={c.company_full_name || c.company_short_name}
                        size={isSmDown ? 44 : 56}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant={isMdDown ? "subtitle1" : "h6"}
                            sx={{ lineHeight: 1.2, fontWeight: 800, wordBreak: "break-word" }}
                        >
                            {c.company_full_name || c.company_short_name || "Company"}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.5 }}
                        >
                            {industries.slice(0, isSmDown ? 3 : 5).map((i) => (
                                <Chip key={i} size="small" label={i} variant="outlined" />
                            ))}
                            {industries.length > (isSmDown ? 3 : 5) && (
                                <Chip size="small" label={`+${industries.length - (isSmDown ? 3 : 5)}`} variant="outlined" />
                            )}
                            {siteDomain && (
                                <Chip
                                    size="small"
                                    icon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                    label={siteDomain}
                                    onClick={() => window.open(c.company_website, "_blank", "noreferrer")}
                                    sx={{ ml: 0.5, maxWidth: "100%" }}
                                />
                            )}
                        </Stack>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                        {c.company_website &&
                            (isSmDown ? (
                                <Tooltip title="Open website">
                                    <IconButton
                                        aria-label="Open website"
                                        onClick={() => window.open(c.company_website, "_blank", "noreferrer")}
                                    >
                                        <OpenInNewIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => window.open(c.company_website, "_blank", "noreferrer")}
                                    sx={{
                                        borderRadius: 999,
                                        px: 2,
                                        background:
                                            "linear-gradient(90deg, rgba(80,70,255,1) 0%, rgba(0,188,212,1) 100%)",
                                    }}
                                    startIcon={<OpenInNewIcon />}
                                >
                                    Website
                                </Button>
                            ))}
                        <Tooltip title="Close">
                            <IconButton aria-label="Close dialog" onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Row 2: tiny flags strip in header */}
                {!!countries.length && (
                    <Box
                        sx={{
                            mt: 1,
                            px: 0.25,
                            overflowX: "auto",
                            ...noScrollbar,
                        }}
                    >
                        <CountryFlagsStrip countries={countries} size={14} />
                    </Box>
                )}

                {/* Row 3: stat pills */}
                <Box
                    component={motion.div}
                    variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
                    initial="initial"
                    animate="animate"
                    sx={{
                        mt: 1.25,
                        ...(isSmDown ? { overflowX: "auto", ...noScrollbar } : {}),
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            flexWrap: isSmDown ? "nowrap" : "wrap",
                            width: isSmDown ? "max-content" : "auto",
                            pb: isSmDown ? 0.5 : 0,
                        }}
                    >
                        {stats.map((s, idx) => (
                            <StatPill key={`${s.label}-${idx}`} icon={s.icon} label={s.label} value={s.value} />
                        ))}
                    </Stack>
                </Box>
            </DialogTitle>

            <DialogContent
                dividers={false}
                sx={{
                    p: { xs: 1.25, sm: 1.5, md: 2 },
                    overflowY: "auto",
                }}
            >
                <Grid container spacing={2}>
                    {/* LEFT COLUMN */}
                    <Grid item xs={12} md={7} lg={8}>
                        {(c.company_description || c.core_products) && (
                            <Box ref={sectionRefs.overview}>
                                <SectionTitle icon={InfoOutlinedIcon}>Overview</SectionTitle>
                                <SoftCard>
                                    <Stack spacing={1}>
                                        {c.company_description && (
                                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                                {c.company_description}
                                            </Typography>
                                        )}
                                        {c.core_products && (
                                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                                {c.core_products}
                                            </Typography>
                                        )}
                                    </Stack>
                                </SoftCard>
                            </Box>
                        )}

                        {!!products.length && (
                            <Box sx={{ mt: 2 }} ref={sectionRefs.products}>
                                <SectionTitle icon={Inventory2Icon}>Products ({products.length})</SectionTitle>
                                <Grid container spacing={1.25}>
                                    {products.map((p, idx) => (
                                        <Grid key={`${p.product_name ?? "product"}-${idx}`} item xs={12} sm={12} md={6}>
                                            <SoftCard sx={{ height: "100%" }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                                    {p.product_name ?? "Product"}
                                                </Typography>
                                                {p.product_description && (
                                                    <TruncateWithHover text={p.product_description} maxChars={66} />
                                                )}
                                            </SoftCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {!!services.length && (
                            <Box sx={{ mt: 2 }} ref={sectionRefs.services}>
                                <SectionTitle icon={BusinessIcon}>Services ({services.length})</SectionTitle>
                                <Grid container spacing={1.25}>
                                    {services.map((s, idx) => (
                                        <Grid key={`${s.service_name || "service"}-${idx}`} item xs={12} sm={12} md={6}>
                                            <SoftCard sx={{ height: "100%" }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                                    {s.service_name || "Service"}
                                                </Typography>
                                                {s.service_description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                                        {s.service_description}
                                                    </Typography>
                                                )}
                                            </SoftCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Grid>

                    {/* RIGHT COLUMN */}
                    <Grid item xs={12} md={5} lg={4}>
                        {!!countries.length && (
                            <Box ref={sectionRefs.countries}>
                                <SectionTitle icon={LocationOnIcon}>Active Countries ({countries.length})</SectionTitle>

                                {/* Countries as compact cards (grid like products/services) */}
                                <Grid container spacing={1.25}>
                                    {countries.map((ac, idx) => {
                                        const name = ac?.country_name || "Country";
                                        const iso = COUNTRY_TO_ISO[name];
                                        const firstIso = Array.isArray(iso) ? iso[0] : iso;
                                        return (
                                            <Grid key={`${name}-${idx}`} item xs={12} sm={12} md={6}>
                                                <SoftCard sx={{ height: "100%" }}>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                                                        <FlagIcon code={firstIso} size={16} radius={0.75} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                                            {name}
                                                        </Typography>
                                                    </Stack>
                                                    {!!ac?.activity_description && (
                                                        <TruncateWithHover text={ac.activity_description} maxChars={66} placement="bottom-start" />
                                                    )}
                                                </SoftCard>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        )}

                        {!!tags.length && (
                            <Box sx={{ mt: 2 }} ref={sectionRefs.tags}>
                                <SectionTitle icon={TagIcon}>Tags</SectionTitle>
                                <SoftCard>
                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                                        {tags.map((t) => (
                                            <Chip key={t} label={t} size="small" />
                                        ))}
                                    </Stack>
                                </SoftCard>
                            </Box>
                        )}
                    </Grid>
                </Grid>

                {(moves.length || partnerships.length) && <Divider sx={{ my: 2 }} />}

                {!!moves.length && (
                    <Box ref={sectionRefs.moves}>
                        <SectionTitle icon={CalendarMonthIcon}>Recent Moves ({moves.length})</SectionTitle>
                        <SoftCard>
                            <TimelineList items={moves} primaryKey="move_name" secondaryKey="move_description" />
                        </SoftCard>
                    </Box>
                )}

                {!!partnerships.length && (
                    <Box sx={{ mt: 2 }} ref={sectionRefs.partnerships}>
                        <SectionTitle icon={Diversity3Icon}>Partnerships ({partnerships.length})</SectionTitle>
                        <SoftCard>
                            <TimelineList items={partnerships} primaryKey="partnership_name" secondaryKey="partnership_description" />
                        </SoftCard>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
