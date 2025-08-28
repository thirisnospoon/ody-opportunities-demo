// components/CompanyCard.jsx
import React from "react";
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Chip,
    Stack,
    Box,
    Link as MLink,
    Button,
    Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LanguageIcon from "@mui/icons-material/Language";

function domainFromUrl(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

function InitialBadge({ text = "" }) {
    const letter = (text || "•").trim().charAt(0).toUpperCase();
    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 700,
                background: "linear-gradient(135deg, #7C4DFF 0%, #00BCD4 100%)",
                boxShadow: 2,
                flex: "0 0 auto",
            }}
        >
            {letter}
        </Box>
    );
}

/* ---- tiny flags on card ---- */
const COUNTRY_TO_ISO = {
    Argentina: "AR",
    Azerbaijan: "AZ",
    Bahrain: "BH",
    Belarus: "BY",
    Canada: "CA",
    Egypt: "EG",
    "Gulf Cooperation Council (GCC) countries": ["AE", "SA", "KW", "QA", "OM", "BH"],
    India: "IN",
    Jordan: "JO",
    Kazakhstan: "KZ",
    Kuwait: "KW",
    Mauritius: "MU",
    Mexico: "MX",
    "Middle East and North Africa (MENA) region": [
        "DZ","BH","CY","EG","IR","IQ","IL","JO","KW","LB","LY","MA","OM","PS","QA","SA","SY","TN","TR","AE","YE"
    ],
    Morocco: "MA",
    "New Zealand": "NZ",
    Oman: "OM",
    Philippines: "PH",
    Romania: "RO",
    Russia: "RU",
    "Saudi Arabia": "SA",
    Serbia: "RS",
    Seychelles: "SC",
    Syria: "SY",
    "The Netherlands": "NL",
    Turkey: "TR",
    "United Arab Emirates": "AE",
    "United Kingdom": "GB",
    "United States": "US",
};

function FlagIcon({ code, size = 12, radius = 0.5 }) {
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
                    flex: "0 0 auto",
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
                sx={{ "--fi-size": `${size}px`, display: "block", width: "100%", height: "100%" }}
            />
        </Box>
    );
}

function CardFlags({ countries = [], maxVisible = 10, size = 12 }) {
    const codes = [];
    (countries || []).forEach((c) => {
        const iso = COUNTRY_TO_ISO[c?.country_name];
        if (!iso) return;
        if (Array.isArray(iso)) codes.push(...iso);
        else codes.push(iso);
    });
    const unique = [...new Set(codes)];
    const visible = unique.slice(0, maxVisible);
    const rest = unique.length - visible.length;

    if (!unique.length) return null;

    return (
        <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexWrap: "wrap", maxWidth: "100%", minWidth: 0 }}
        >
            {visible.map((code) => (
                <FlagIcon key={code} code={code} size={size} />
            ))}
            {rest > 0 && (
                <Chip
                    size="small"
                    label={`+${rest}`}
                    variant="outlined"
                    sx={{
                        height: size + 6,
                        borderRadius: 999,
                        "& .MuiChip-label": { px: 0.75, fontSize: 10 },
                        flex: "0 0 auto",
                    }}
                />
            )}
        </Stack>
    );
}

export default function CompanyCard({ company, onOpen }) {
    const industries = company.industries || [];
    const countries = company.active_countries || [];
    const countriesCount = countries.length;
    const productsCount = (company.products || []).length;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            sx={{ width: "100%", maxWidth: "100%", display: "block", minWidth: 0 }}
        >
            <Card
                variant="outlined"
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "transform .18s ease, box-shadow .18s ease",
                    ":hover": { boxShadow: 6, transform: "translateY(-2px)" },
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                <CardActionArea
                    onClick={onOpen}
                    sx={{
                        width: "100%",
                        maxWidth: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                    }}
                >
                    <Box
                        sx={{
                            height: 8,
                            background: "linear-gradient(90deg, #7C4DFF 0%, #00BCD4 60%, #26A69A 100%)",
                            flex: "0 0 auto",
                        }}
                    />

                    <CardContent
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.1,
                            flex: "1 1 auto",
                            minWidth: 0,
                        }}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                            <InitialBadge text={company.company_full_name || company.company_short_name || ""} />
                            <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <Typography variant="h6" sx={{ lineHeight: 1.2 }} noWrap>
                                    {company.company_full_name || company.company_short_name}
                                </Typography>
                                {company.company_website && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        noWrap
                                        sx={{ minWidth: 0, overflow: "hidden" }}
                                    >
                                        <MLink
                                            href={company.company_website}
                                            target="_blank"
                                            rel="noreferrer"
                                            underline="hover"
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                minWidth: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                maxWidth: "100%",
                                            }}
                                        >
                                            {domainFromUrl(company.company_website)} <OpenInNewIcon fontSize="inherit" />
                                        </MLink>
                                    </Typography>
                                )}
                            </Box>
                            {company.founded && <Chip size="small" label={`Founded ${company.founded}`} />}
                        </Stack>

                        {/* Tiny flags row */}
                        <CardFlags countries={countries} size={12} />

                        {company.core_products && (
                            <Typography
                                variant="body2"
                                sx={{ mt: 0.25, color: "text.primary", wordBreak: "break-word", overflowWrap: "anywhere" }}
                            >
                                {company.core_products}
                            </Typography>
                        )}

                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", mt: 0.25, minWidth: 0 }}>
                            {industries.slice(0, 3).map((i) => (
                                <Chip key={i} size="small" label={i} sx={{ mb: 0.5 }} />
                            ))}
                            {industries.length > 3 && <Chip size="small" label={`+${industries.length - 3}`} sx={{ mb: 0.5 }} />}
                        </Stack>
                    </CardContent>

                    <Box
                        sx={{
                            px: 2,
                            py: 1,
                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "background.paper",
                            width: "100%",
                            maxWidth: "100%",
                            minWidth: 0,
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tooltip title="Countries">
                                <Typography variant="caption">🌍 {countriesCount}</Typography>
                            </Tooltip>
                            <Tooltip title="Products">
                                <Typography variant="caption">🧩 {productsCount}</Typography>
                            </Tooltip>
                        </Stack>

                        <Button
                            size="small"
                            variant="text"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                            sx={{ borderRadius: 999 }}
                        >
                            View details
                        </Button>
                    </Box>
                </CardActionArea>
            </Card>
        </Box>
    );
}
