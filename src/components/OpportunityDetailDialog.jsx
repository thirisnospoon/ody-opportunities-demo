// components/OpportunityDetailDialog.jsx
// Standalone popup with production-grade layout and color-coded sections

import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Box,
    Typography,
    Chip,
    Grid,
    Button,
    Divider,
    useMediaQuery,
    Paper,
    Collapse,
    Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import TagIcon from "@mui/icons-material/Tag";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FlagIcon from "@mui/icons-material/Flag";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

function ScoreRing({ value = 0, size = 72 }) {
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
                    stroke="url(#grad2)"
                    strokeWidth="3"
                    strokeDasharray={`${pct}, 100`}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7C4DFF" />
                        <stop offset="100%" stopColor="#00E5FF" />
                    </linearGradient>
                </defs>
            </svg>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 18,
                }}
            >
                {clamped}
            </Box>
        </Box>
    );
}

function Section({ title, icon: Icon, color, children, dense }) {
    const theme = useTheme();
    const bg = alpha(color || theme.palette.primary.main, 0.06);
    const border = alpha(color || theme.palette.primary.main, 0.38);
    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 1.25, sm: dense ? 1.25 : 1.75 },
                borderRadius: 3,
                bgcolor: bg,
                borderColor: border,
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                {Icon ? <Icon fontSize="small" sx={{ color }} /> : null}
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {title}
                </Typography>
            </Stack>
            {children}
        </Paper>
    );
}

/** Collapsible, closed-by-default section (used for Source event) */
function CollapsibleSection({
                                title,
                                icon: Icon,
                                color,
                                children,
                                defaultOpen = false,
                            }) {
    const theme = useTheme();
    const [open, setOpen] = useState(defaultOpen);
    const bg = alpha(color || theme.palette.primary.main, 0.06);
    const border = alpha(color || theme.palette.primary.main, 0.38);

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                borderColor: border,
                bgcolor: bg,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => setOpen((v) => !v)}
                sx={{
                    px: { xs: 1.25, sm: 1.75 },
                    py: 1.25,
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": { bgcolor: alpha(color || theme.palette.primary.main, 0.08) },
                }}
            >
                {Icon ? <Icon fontSize="small" sx={{ color }} /> : null}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, flex: 1 }}>
                    {title}
                </Typography>
                <ExpandMoreRoundedIcon
                    sx={{
                        color,
                        transition: "transform .2s",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                />
            </Stack>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ px: { xs: 1.25, sm: 1.75 }, pb: { xs: 1.25, sm: 1.75 } }}>
                    {children}
                </Box>
            </Collapse>
        </Paper>
    );
}

export default function OpportunityDetailDialog({
                                                    open,
                                                    onClose,
                                                    opportunity: op,
                                                    companyName,
                                                }) {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
    const tags = useMemo(() => op?.tags || [], [op]);
    const companies = useMemo(() => op?.companies_mentioned || [], [op]);
    const se = op?.source_event;

    const hostFromUrl = (url) => {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return "";
        }
    };

    if (!op) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            fullScreen={isSmDown}
            scroll="paper"
            aria-labelledby="op-detail-title"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: isSmDown ? 0 : 3,
                        overflow: "hidden",
                        maxHeight: isSmDown ? "100dvh" : "94dvh",
                    },
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                id="op-detail-title"
                sx={{
                    p: { xs: 1.25, sm: 2, md: 2.25 },
                    pb: { xs: 1, sm: 1.25 },
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                    background: `linear-gradient(90deg, ${alpha(
                        theme.palette.primary.main,
                        0.12
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <ScoreRing value={op.possibility_mark} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant={isSmDown ? "subtitle1" : "h6"}
                            sx={{
                                fontWeight: 900,
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                            }}
                        >
                            {op.title || "Opportunity"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {companyName}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {op.uuid && (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ContentCopyIcon />}
                                onClick={() => navigator.clipboard?.writeText(op.uuid)}
                                sx={{ borderRadius: 999 }}
                            >
                                Copy UUID
                            </Button>
                        )}
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<IosShareRoundedIcon />}
                            onClick={() =>
                                navigator.clipboard?.writeText(JSON.stringify(op, null, 2))
                            }
                            sx={{ borderRadius: 999 }}
                        >
                            Copy JSON
                        </Button>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: { xs: 1.25, sm: 2 } }}>
                <Grid container spacing={1.5}>
                    {/* Main column */}
                    <Grid item xs={12} md={8}>
                        {op.description && (
                            <Section
                                title="Overview"
                                icon={InsightsOutlinedIcon}
                                color={theme.palette.info.main}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ whiteSpace: "pre-wrap" }}
                                >
                                    {op.description}
                                </Typography>
                            </Section>
                        )}

                        {op.explanation && (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title="Why it’s realistic"
                                    icon={InsightsOutlinedIcon}
                                    color={theme.palette.success.main}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                        {op.explanation}
                                    </Typography>
                                </Section>
                            </Box>
                        )}

                        {op.value && (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title="Value"
                                    icon={CheckCircleOutlineIcon}
                                    color={theme.palette.warning.main}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                        {op.value}
                                    </Typography>
                                </Section>
                            </Box>
                        )}

                        {Array.isArray(op.roadmap_steps) && op.roadmap_steps.length > 0 && (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title={`Roadmap steps (${op.roadmap_steps.length})`}
                                    icon={FlagIcon}
                                    color={theme.palette.primary.main}
                                >
                                    <Stack component="ol" spacing={0.75} sx={{ pl: 2, m: 0 }}>
                                        {op.roadmap_steps.map((s, i) => (
                                            <Typography
                                                component="li"
                                                key={i}
                                                variant="body2"
                                                sx={{
                                                    wordBreak: "break-word",
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {s}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Section>
                            </Box>
                        )}

                        {Array.isArray(op.suggested_actions) &&
                            op.suggested_actions.length > 0 && (
                                <Box sx={{ mt: 1.25 }}>
                                    <Section
                                        title={`Suggested actions (${op.suggested_actions.length})`}
                                        icon={AssignmentTurnedInIcon}
                                        color={theme.palette.secondary.main}
                                    >
                                        <Stack component="ul" spacing={0.75} sx={{ pl: 2, m: 0 }}>
                                            {op.suggested_actions.map((s, i) => (
                                                <Typography
                                                    component="li"
                                                    key={i}
                                                    variant="body2"
                                                    sx={{
                                                        wordBreak: "break-word",
                                                        overflowWrap: "anywhere",
                                                    }}
                                                >
                                                    {s}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Section>
                                </Box>
                            )}

                        {Array.isArray(op.risks) && op.risks.length > 0 && (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title="Risks"
                                    icon={ReportProblemOutlinedIcon}
                                    color={theme.palette.error.main}
                                >
                                    <Stack component="ul" spacing={0.75} sx={{ pl: 2, m: 0 }}>
                                        {op.risks.map((r, i) => (
                                            <Typography
                                                component="li"
                                                key={i}
                                                variant="body2"
                                                sx={{
                                                    wordBreak: "break-word",
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {r}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Section>
                            </Box>
                        )}

                        {op.investments && typeof op.investments === "object" && (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title="Investments"
                                    icon={HourglassBottomOutlinedIcon}
                                    color={theme.palette.warning.dark}
                                >
                                    <Grid container spacing={1}>
                                        {op.investments.budget && (
                                            <Grid item xs={12} sm={6}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                                                        borderColor: alpha(theme.palette.warning.main, 0.3),
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                        Budget
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {op.investments.budget}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        )}
                                        {op.investments.people && (
                                            <Grid item xs={12} sm={6}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.info.main, 0.08),
                                                        borderColor: alpha(theme.palette.info.main, 0.3),
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                        People
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {op.investments.people}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        )}
                                        {op.investments.time && (
                                            <Grid item xs={12} sm={6}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                                        borderColor: alpha(theme.palette.success.main, 0.3),
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                        Time
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {op.investments.time}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        )}
                                        {op.investments["tools/other"] && (
                                            <Grid item xs={12} sm={6}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.25,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                                        borderColor: alpha(theme.palette.secondary.main, 0.3),
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                        Tools/Other
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {op.investments["tools/other"]}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Section>
                            </Box>
                        )}

                        {/* Source event: closed by default, separate, well-styled */}
                        {se && (
                            <Box sx={{ mt: 1.25 }}>
                                <CollapsibleSection
                                    title="Source event"
                                    icon={DescriptionOutlinedIcon}
                                    color={theme.palette.grey[700]}
                                    defaultOpen={false}
                                >
                                    {/* Title + quick actions */}
                                    <Stack spacing={1}>
                                        {se.title && (
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 800, lineHeight: 1.2 }}
                                            >
                                                {se.title}
                                            </Typography>
                                        )}

                                        {se.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ whiteSpace: "pre-wrap" }}
                                            >
                                                {se.description}
                                            </Typography>
                                        )}

                                        {/* Meta grid */}
                                        <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
                                            {/* Tags */}
                                            {Array.isArray(se.tags) && se.tags.length > 0 && (
                                                <Grid item xs={12}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.secondary.main, 0.06),
                                                            borderColor: alpha(theme.palette.secondary.main, 0.35),
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                            <TagIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                                Tags
                                                            </Typography>
                                                        </Stack>
                                                        <Stack
                                                            direction="row"
                                                            spacing={0.75}
                                                            sx={{ flexWrap: "wrap", rowGap: 0.5 }}
                                                        >
                                                            {se.tags.map((t) => (
                                                                <Chip key={t} size="small" label={t} variant="outlined" />
                                                            ))}
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            )}

                                            {/* Industry */}
                                            {Array.isArray(se.industry) && se.industry.length > 0 && (
                                                <Grid item xs={12} sm={6}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.info.main, 0.06),
                                                            borderColor: alpha(theme.palette.info.main, 0.35),
                                                            height: "100%",
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                            <ScienceOutlinedIcon
                                                                fontSize="small"
                                                                sx={{ color: theme.palette.info.main }}
                                                            />
                                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                                Industry
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                                                            {se.industry.map((i) => (
                                                                <Chip key={i} size="small" label={i} />
                                                            ))}
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            )}

                                            {/* Companies mentioned */}
                                            {Array.isArray(se.companies_mentioned) &&
                                                se.companies_mentioned.length > 0 && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1,
                                                                borderRadius: 2,
                                                                bgcolor: alpha(theme.palette.success.main, 0.06),
                                                                borderColor: alpha(theme.palette.success.main, 0.35),
                                                                height: "100%",
                                                            }}
                                                        >
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                                <BusinessOutlinedIcon
                                                                    fontSize="small"
                                                                    sx={{ color: theme.palette.success.main }}
                                                                />
                                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                                    Companies mentioned
                                                                </Typography>
                                                            </Stack>
                                                            <Stack spacing={0.5}>
                                                                {se.companies_mentioned.map((c) => (
                                                                    <Chip key={c} size="small" label={c} variant="outlined" />
                                                                ))}
                                                            </Stack>
                                                        </Paper>
                                                    </Grid>
                                                )}

                                            {/* Info cards: year, company, source name/origin, AI model */}
                                            <Grid item xs={12} md={6}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.1,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.warning.main, 0.06),
                                                        borderColor: alpha(theme.palette.warning.main, 0.35),
                                                    }}
                                                >
                                                    <Stack spacing={0.5}>
                                                        {se.year && (
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <CalendarMonthOutlinedIcon fontSize="small" />
                                                                <Typography variant="body2">
                                                                    <b>Year:</b> {se.year}
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                        {se.company_name && (
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <CorporateFareOutlinedIcon fontSize="small" />
                                                                <Typography variant="body2">
                                                                    <b>Company:</b> {se.company_name}
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                        {se.source_name && (
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <DescriptionOutlinedIcon fontSize="small" />
                                                                <Typography variant="body2">
                                                                    <b>Source:</b> {se.source_name}
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                        {se.source_origin && (
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <LinkOutlinedIcon fontSize="small" />
                                                                <Typography variant="body2">
                                                                    <b>Origin:</b> {se.source_origin}
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                        {(se.ai_model || se.ai_model_type) && (
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <ScienceOutlinedIcon fontSize="small" />
                                                                <Typography variant="body2">
                                                                    <b>AI:</b> {se.ai_model}
                                                                    {se.ai_model_type ? ` (${se.ai_model_type})` : ""}
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                    </Stack>
                                                </Paper>
                                            </Grid>

                                            {/* Open source + copy link */}
                                            {(se.source_url || se.source_name) && (
                                                <Grid item xs={12} md={6}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1.1,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                                                            borderColor: alpha(theme.palette.primary.main, 0.35),
                                                            height: "100%",
                                                        }}
                                                    >
                                                        <Stack spacing={1}>
                                                            {se.source_url ? (
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <LinkOutlinedIcon fontSize="small" />
                                                                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                                                                        {se.source_url}
                                                                    </Typography>
                                                                </Stack>
                                                            ) : null}
                                                            <Stack direction="row" spacing={1}>
                                                                {se.source_url && (
                                                                    <Button
                                                                        size="small"
                                                                        variant="contained"
                                                                        startIcon={<LaunchRoundedIcon />}
                                                                        component="a"
                                                                        href={se.source_url}
                                                                        target="_blank"
                                                                        rel="noopener"
                                                                        sx={{ borderRadius: 999 }}
                                                                    >
                                                                        Open source {hostFromUrl(se.source_url) ? `(${hostFromUrl(se.source_url)})` : ""}
                                                                    </Button>
                                                                )}
                                                                {se.source_url && (
                                                                    <Tooltip title="Copy source URL">
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            startIcon={<ContentCopyIcon />}
                                                                            onClick={() =>
                                                                                navigator.clipboard?.writeText(se.source_url)
                                                                            }
                                                                            sx={{ borderRadius: 999 }}
                                                                        >
                                                                            Copy link
                                                                        </Button>
                                                                    </Tooltip>
                                                                )}
                                                            </Stack>
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Stack>
                                </CollapsibleSection>
                            </Box>
                        )}
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Section title="Summary" color={theme.palette.primary.main}>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ScoreRing value={op.possibility_mark} size={64} />
                                    <Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            Possibility mark
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                            {op.possibility_mark ?? 0} / 10
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Divider />
                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                                    <Chip size="small" icon={<TagIcon />} label={`${tags.length} tags`} />
                                    {companies.length ? (
                                        <Chip
                                            size="small"
                                            icon={<BusinessOutlinedIcon />}
                                            label={`${companies.length} companies`}
                                        />
                                    ) : null}
                                    {op.uuid ? (
                                        <Chip
                                            size="small"
                                            label={`UUID: ${String(op.uuid).slice(0, 8)}…`}
                                            onClick={() => navigator.clipboard?.writeText(op.uuid)}
                                            variant="outlined"
                                        />
                                    ) : null}
                                </Stack>
                            </Stack>
                        </Section>

                        {tags.length ? (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title="Tags"
                                    icon={LocalOfferIcon}
                                    color={theme.palette.secondary.main}
                                    dense
                                >
                                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                                        {tags.map((t) => (
                                            <Chip key={t} size="small" label={t} variant="outlined" icon={<TagIcon />} />
                                        ))}
                                    </Stack>
                                </Section>
                            </Box>
                        ) : null}

                        {companies.length ? (
                            <Box sx={{ mt: 1.25 }}>
                                <Section
                                    title="Companies mentioned"
                                    icon={BusinessOutlinedIcon}
                                    color={theme.palette.info.main}
                                    dense
                                >
                                    <Stack spacing={0.5}>
                                        {companies.map((c) => (
                                            <Chip key={c} size="small" label={c} variant="outlined" icon={<BusinessOutlinedIcon />} />
                                        ))}
                                    </Stack>
                                </Section>
                            </Box>
                        ) : null}

                        {op.uuid ? (
                            <Box sx={{ mt: 1.25 }}>
                                <Section title="Identifiers" color={theme.palette.grey[600]} dense>
                                    <Stack spacing={1}>
                                        <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                UUID
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                                                {op.uuid}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<ContentCopyIcon />}
                                                    onClick={() => navigator.clipboard?.writeText(op.uuid)}
                                                    sx={{ borderRadius: 999 }}
                                                >
                                                    Copy UUID
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<IosShareRoundedIcon />}
                                                    onClick={() =>
                                                        navigator.clipboard?.writeText(JSON.stringify(op, null, 2))
                                                    }
                                                    sx={{ borderRadius: 999 }}
                                                >
                                                    Copy JSON
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    </Stack>
                                </Section>
                            </Box>
                        ) : null}
                    </Grid>
                </Grid>
            </DialogContent>

            {/* Footer actions */}
            <DialogActions
                sx={{
                    px: { xs: 1.25, sm: 2 },
                    py: 1.25,
                    borderTop: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "flex-end" }}>
                    {op.uuid && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={() => navigator.clipboard?.writeText(op.uuid)}
                            sx={{ borderRadius: 999 }}
                        >
                            Copy UUID
                        </Button>
                    )}
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<IosShareRoundedIcon />}
                        onClick={() => navigator.clipboard?.writeText(JSON.stringify(op, null, 2))}
                        sx={{ borderRadius: 999 }}
                    >
                        Copy JSON
                    </Button>
                    <Button size="small" onClick={onClose} sx={{ borderRadius: 999 }}>
                        Close
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
