// components/EventDialog.jsx  (NEW MODULE)
import React, { forwardRef, useMemo } from "react";
import {
    Dialog,
    Slide,
    Box,
    IconButton,
    Typography,
    Stack,
    Chip,
    Divider,
    Avatar,
    Button,
    Grid,
    Tooltip,
    Card,
    CardContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MemoryIcon from "@mui/icons-material/Memory";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function MarkBar({ value = 0 }) {
    // value 0..10
    const pct = Math.max(0, Math.min(10, Number(value))) * 10;
    return (
        <Box sx={{ position: "relative", height: 10, borderRadius: 999, backgroundColor: "action.hover" }}>
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    borderRadius: 999,
                    transition: "width .25s",
                    background:
                        "linear-gradient(90deg, rgba(99,102,241,.85) 0%, rgba(16,185,129,.85) 100%)",
                }}
            />
        </Box>
    );
}

function RoadmapList({ steps = [] }) {
    return (
        <Stack sx={{ position: "relative" }} spacing={1.5}>
            {steps.map((s, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start" sx={{ position: "relative" }}>
                    <Box
                        sx={{
                            mt: 0.5,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle at 30% 30%, #22c55e 0%, #22c55e 40%, #10b981 41%, #10b981 100%)",
                            boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
                            flex: "0 0 auto",
                            position: "relative",
                        }}
                    />
                    <Box sx={{ pt: 0.25 }}>
                        <Typography variant="body2">{s}</Typography>
                    </Box>
                    {i < steps.length - 1 && (
                        <Box
                            sx={{
                                position: "absolute",
                                left: 4.5,
                                top: 10,
                                bottom: -12,
                                width: 1.5,
                                background:
                                    "linear-gradient(180deg, rgba(34,197,94,0.15), rgba(34,197,94,0))",
                            }}
                        />
                    )}
                </Stack>
            ))}
        </Stack>
    );
}

function OpportunityCard({ op }) {
    const { title, description, industry, possibility_mark, roadmap_steps = [] } = op || {};
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: "hidden",
                borderColor: "divider",
                transition: "box-shadow .2s, transform .06s, border-color .2s",
                "&:hover": { boxShadow: 3, borderColor: "primary.light" },
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {title}
                        </Typography>
                        <Chip
                            size="small"
                            label={`Possibility ${Number(possibility_mark ?? 0)}/10`}
                            color="primary"
                            variant="outlined"
                        />
                    </Stack>

                    <MarkBar value={possibility_mark} />

                    {!!industry && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CategoryIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                {industry}
                            </Typography>
                        </Stack>
                    )}

                    {description && <Typography variant="body2">{description}</Typography>}

                    {Array.isArray(roadmap_steps) && roadmap_steps.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Roadmap
                            </Typography>
                            <RoadmapList steps={roadmap_steps} />
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function EventDialog({ open, onClose, event }) {
    const {
        title,
        description,
        tags = [],
        industry = [],
        companies_mentioned = [],
        year,
        company_name,
        source_url,
        source_name,
        source_origin,
        ai_model,
        ai_model_type,
        opportunities = [],
    } = event || {};

    const initials = useMemo(() => {
        const s = (company_name || title || "E").trim();
        const parts = s.split(/\s+/);
        const first = parts[0]?.[0] || "";
        const second = parts[1]?.[0] || "";
        return (first + second).toUpperCase();
    }, [company_name, title]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            keepMounted
            fullWidth
            maxWidth="xl"
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 3 },
                    width: "min(1200px, 96vw)",
                    height: { xs: "100vh", sm: "min(94vh, 980px)" },
                    overflow: "hidden",
                },
            }}
        >
            {/* Header / Hero */}
            <Box
                sx={{
                    position: "relative",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 2.5 },
                    background:
                        "radial-gradient(1200px 420px at 10% -10%, rgba(99,102,241,.20), rgba(0,0,0,0))," +
                        "linear-gradient(135deg, rgba(59,130,246,.15), rgba(16,185,129,.15))",
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        bgcolor: "background.paper",
                        zIndex: 2,
                        "&:hover": { bgcolor: "action.hover" },
                    }}
                    aria-label="Close"
                >
                    <CloseIcon />
                </IconButton>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 48, height: 48, fontWeight: 700 }}>{initials}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap title={title}>
                            {title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} useFlexGap flexWrap="wrap">
                            {company_name && (
                                <Chip size="small" icon={<CorporateFareIcon />} label={company_name} variant="outlined" />
                            )}
                            {typeof year !== "undefined" && (
                                <Chip size="small" icon={<CalendarMonthIcon />} label={year} variant="outlined" />
                            )}
                            {source_origin && <Chip size="small" icon={<DescriptionIcon />} label={source_origin} />}
                            {(industry?.length ?? 0) > 0 && (
                                <Chip size="small" icon={<CategoryIcon />} label={`${industry.length} industries`} />
                            )}
                            {tags.length > 0 && <Chip size="small" icon={<LocalOfferIcon />} label={`${tags.length} tags`} />}
                            {(ai_model || ai_model_type) && (
                                <Chip
                                    size="small"
                                    icon={<MemoryIcon />}
                                    label={[ai_model, ai_model_type].filter(Boolean).join(" · ")}
                                />
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            {/* Body */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
                    gap: 2,
                    p: { xs: 2, sm: 3 },
                    overflow: "auto",
                }}
            >
                {/* Left rail: quick facts */}
                <Box>
                    <Box
                        sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            background: "linear-gradient(180deg, rgba(99,102,241,.06), rgba(99,102,241,0))",
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary">
                            Overview
                        </Typography>
                        <Divider sx={{ my: 1.25 }} />
                        <Stack spacing={1} useFlexGap flexWrap="wrap">
                            {(industry || []).length > 0 && (
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Industry
                                    </Typography>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {industry.map((i) => (
                                            <Chip key={i} label={i} size="small" />
                                        ))}
                                    </Stack>
                                </Stack>
                            )}

                            {tags.length > 0 && (
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Tags
                                    </Typography>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {tags.map((t) => (
                                            <Chip key={t} label={t} size="small" variant="outlined" />
                                        ))}
                                    </Stack>
                                </Stack>
                            )}

                            {companies_mentioned.length > 0 && (
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Companies mentioned
                                    </Typography>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {companies_mentioned.map((c) => (
                                            <Chip key={c} label={c} size="small" />
                                        ))}
                                    </Stack>
                                </Stack>
                            )}
                        </Stack>

                        {/* Moved Source button here to avoid overlapping Close */}
                        {source_url && (
                            <>
                                <Divider sx={{ my: 1.25 }} />
                                <Tooltip title={source_name || "Open source"}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        endIcon={<OpenInNewIcon />}
                                        component="a"
                                        href={source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Source
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                    </Box>

                    {(ai_model || ai_model_type) && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                background: "linear-gradient(180deg, rgba(16,185,129,.06), rgba(16,185,129,0))",
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                AI Details
                            </Typography>
                            <Divider sx={{ my: 1.25 }} />
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {ai_model && <Chip size="small" label={ai_model} />}
                                {ai_model_type && <Chip size="small" variant="outlined" label={ai_model_type} />}
                            </Stack>
                        </Box>
                    )}
                </Box>

                {/* Right: description + opportunities */}
                <Box>
                    {description && (
                        <Box
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                mb: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                backgroundColor: "background.paper",
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Description
                            </Typography>
                            <Typography variant="body1">{description}</Typography>
                        </Box>
                    )}

                    <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="h6">Opportunities</Typography>
                            <Chip color="primary" variant="outlined" size="small" label={`${opportunities.length || 0}`} />
                        </Stack>

                        {(!opportunities || opportunities.length === 0) ? (
                            <Typography variant="body2" color="text.secondary">
                                No opportunities listed.
                            </Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {opportunities.map((op, idx) => (
                                    <Grid item xs={12} key={`${op.title}-${idx}`}>
                                        <OpportunityCard op={op} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
