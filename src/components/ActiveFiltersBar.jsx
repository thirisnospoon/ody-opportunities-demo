import React from "react";
import { Paper, Box, Stack, Chip } from "@mui/material";

export default function ActiveFiltersBar({ selected = {}, onChange = {}, onResetMarks = () => {} }) {
    const {
        tags = [],
        years = [],
        companies = [],
        mentioned = [],
        origins = [],
        aiModels = [],
        aiTypes = [],
        marksRange = [],
        defaultMarksRange = [0, 10],
    } = selected;

    const remove = (key, value) => {
        const current = selected[key] || [];
        const next = current.filter((v) => String(v) !== String(value));
        onChange[key]?.(next);
    };

    const items = [
        ...tags.map((v) => ({ key: "tags", label: v })),
        ...years.map((v) => ({ key: "years", label: String(v) })),
        ...companies.map((v) => ({ key: "companies", label: v })),
        ...mentioned.map((v) => ({ key: "mentioned", label: v })),
        ...origins.map((v) => ({ key: "origins", label: v })),
        ...aiModels.map((v) => ({ key: "aiModels", label: v })),
        ...aiTypes.map((v) => ({ key: "aiTypes", label: v })),
    ];

    const marksDirty =
        Array.isArray(marksRange) &&
        Array.isArray(defaultMarksRange) &&
        (marksRange[0] !== defaultMarksRange[0] || marksRange[1] !== defaultMarksRange[1]);

    if (items.length === 0 && !marksDirty) return null;

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
                    {marksDirty && (
                        <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={`Mark: ${marksRange[0]}–${marksRange[1]}`}
                            onDelete={() => onResetMarks?.()}
                        />
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}
