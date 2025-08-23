import React, { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardActions,
    CardHeader,
    Avatar,
    Typography,
    Chip,
    Stack,
    Button,
    Tooltip,
    Divider,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import MemoryIcon from "@mui/icons-material/Memory";
import { truncate } from "../utils/format.js";

export default function OpportunityCard({ item }) {
    const [expanded, setExpanded] = useState(false);
    const {
        title,
        description,
        example,
        roadmap = [],
        tags = [],
        industry = [],
        companies_mentioned = [],
        year,
        company_name,
        source_url,
        source_name,
        source_origin,
        opportunity_mark,
        ai_model,
        ai_model_type,
    } = item || {};

    const initials = useMemo(() => {
        const s = (company_name || title || "O").trim();
        const parts = s.split(/\s+/);
        const first = parts[0]?.[0] || "";
        const second = parts[1]?.[0] || "";
        return (first + second).toUpperCase();
    }, [company_name, title]);

    const mentionedPreview = useMemo(() => {
        const max = 4;
        const shown = (companies_mentioned || []).slice(0, max);
        const more = Math.max(0, (companies_mentioned || []).length - max);
        return { shown, more };
    }, [companies_mentioned]);

    return (
        <Card
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 0,
                transition: "box-shadow .2s, transform .06s, border-color .2s",
                "&:hover": { boxShadow: 4, borderColor: "divider" },
                backgroundColor: "background.paper",
            }}
        >
            <CardHeader
                avatar={<Avatar>{initials}</Avatar>}
                titleTypographyProps={{ variant: "subtitle1" }}
                subheaderTypographyProps={{ variant: "body2", color: "text.secondary" }}
                title={title}
                subheader={[company_name, year].filter(Boolean).join(" • ")}
                action={
                    <Stack direction="row" spacing={0.5}>
                        {typeof opportunity_mark === "number" && (
                            <Chip
                                size="small"
                                icon={<StarBorderRoundedIcon />}
                                label={`${opportunity_mark}/10`}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {source_origin ? (
                            <Chip size="small" icon={<DescriptionIcon />} label={source_origin} />
                        ) : null}
                    </Stack>
                }
                sx={{ pb: 0.5 }}
            />

            <CardContent sx={{ flexGrow: 1, pt: { xs: 1, sm: 1.25 } }}>
                <Stack spacing={1.25}>
                    {(industry?.length ?? 0) > 0 && (
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.25 }}>
                            <Chip size="small" icon={<CategoryIcon />} label="Industry" />
                            {industry.map((i) => (
                                <Chip key={i} size="small" label={i} />
                            ))}
                        </Stack>
                    )}

                    {(tags?.length ?? 0) > 0 && (
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.25 }}>
                            <Chip size="small" icon={<LocalOfferIcon />} label="Tags" />
                            {tags.map((t) => (
                                <Chip key={t} size="small" label={t} />
                            ))}
                        </Stack>
                    )}

                    {(ai_model || ai_model_type) && (
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.25 }}>
                            <Chip size="small" icon={<MemoryIcon />} label="AI" />
                            {ai_model && <Chip size="small" label={ai_model} />}
                            {ai_model_type && <Chip size="small" variant="outlined" label={ai_model_type} />}
                        </Stack>
                    )}

                    <Divider />

                    {description && (
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Description
                            </Typography>
                            <Typography variant="body2">
                                {expanded ? description : truncate(description, 260)}
                            </Typography>
                        </Stack>
                    )}

                    {example && (
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Example
                            </Typography>
                            <Typography variant="body2">
                                {expanded ? example : truncate(example, 220)}
                            </Typography>
                        </Stack>
                    )}

                    {Array.isArray(roadmap) && roadmap.length > 0 && (
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Roadmap
                            </Typography>
                            <Stack component="ul" sx={{ pl: 2, m: 0 }} spacing={0.5}>
                                {roadmap.slice(0, expanded ? roadmap.length : 3).map((step, i) => (
                                    <Typography key={i} component="li" variant="body2">
                                        {step}
                                    </Typography>
                                ))}
                                {!expanded && roadmap.length > 3 && (
                                    <Typography variant="body2" color="text.secondary">
                                        …and {roadmap.length - 3} more
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                    )}

                    {mentionedPreview.shown.length > 0 && (
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Companies mentioned
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {mentionedPreview.shown.map((c) => (
                                    <Chip key={c} label={c} size="small" />
                                ))}
                                {mentionedPreview.more > 0 && (
                                    <Chip size="small" label={`+${mentionedPreview.more} more`} />
                                )}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1}>
                    {company_name && (
                        <Chip size="small" icon={<CorporateFareIcon />} label={company_name} variant="outlined" />
                    )}
                    {typeof year !== "undefined" && (
                        <Chip size="small" icon={<CalendarMonthIcon />} label={year} variant="outlined" />
                    )}
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => setExpanded((v) => !v)}>
                        {expanded ? "Less" : "More"}
                    </Button>
                    {source_url && (
                        <Tooltip title={source_name || "Open source"}>
                            <Button
                                size="small"
                                endIcon={<OpenInNewIcon />}
                                onClick={() => window.open(source_url, "_blank", "noopener")}
                            >
                                Source
                            </Button>
                        </Tooltip>
                    )}
                </Stack>
            </CardActions>
        </Card>
    );
}
