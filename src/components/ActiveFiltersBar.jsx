import React from "react";
import { Paper, Box, Stack, Chip } from "@mui/material";

export default function ActiveFiltersBar({ selected = {}, onChange = {} }) {
    const { tags = [], years = [], companies = [], mentioned = [], origins = [] } = selected;

    const remove = (key, value) => {
        const current = (selected[key] || []);
        const next = current.filter((v) => String(v) !== String(value));
        onChange[key]?.(next);
    };

    const items = [
        ...tags.map((v) => ({ key: "tags", label: v })),
        ...years.map((v) => ({ key: "years", label: String(v) })),
        ...companies.map((v) => ({ key: "companies", label: v })),
        ...mentioned.map((v) => ({ key: "mentioned", label: v })),
        ...origins.map((v) => ({ key: "origins", label: v })),
    ];

    if (items.length === 0) return null;

    return (
        <Paper variant="outlined">
            <Box p={1}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {items.map(({ key, label }) => (
                        <Chip
                            key={`${key}:${label}`}
                            size="small"
                            label={label}
                            onDelete={() => remove(key, label)}
                        />
                    ))}
                </Stack>
            </Box>
        </Paper>
    );
}
