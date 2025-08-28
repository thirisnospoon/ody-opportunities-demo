// components/CompaniesFiltersDrawer.jsx
import React from "react";
import {
    Box,
    Drawer,
    Paper,
    Stack,
    Typography,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Button,
} from "@mui/material";

function MultiSelect({ label, options = [], value = [], onChange }) {
    const safeValue = Array.isArray(value) ? value : [];
    return (
        <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={safeValue}
                onChange={(e) => onChange(e.target.value || [])}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {selected.map((val) => (
                            <Chip key={val} size="small" label={val} />
                        ))}
                    </Box>
                )}
            >
                {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                        {opt}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default function CompaniesFiltersDrawer({
                                                   permanent,
                                                   width,
                                                   open,
                                                   onClose,
                                                   facets,
                                                   selected,
                                                   onChange,
                                               }) {
    const onClear = () => {
        onChange.industries([]);
        onChange.countries([]);
    };

    const content = (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                position: permanent ? "sticky" : "relative",
                top: permanent ? 16 : "auto",
                width: "100%",
                borderRadius: 3,
            }}
        >
            <Stack spacing={2}>
                <Typography variant="subtitle1">Filters</Typography>
                <Divider />

                <MultiSelect
                    label="Industries"
                    options={facets.industries}
                    value={selected.industries}
                    onChange={onChange.industries}
                />
                <MultiSelect
                    label="Countries"
                    options={facets.countries}
                    value={selected.countries}
                    onChange={onChange.countries}
                />

                <Stack direction="row" spacing={1}>
                    {!permanent && (
                        <Button variant="contained" onClick={onClose}>
                            Apply
                        </Button>
                    )}
                    <Button variant="text" onClick={onClear}>
                        Clear
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );

    if (permanent)
        return (
            <Box sx={{ width: "100%" }}>{content}</Box>
        );

    return (
        <Drawer anchor="bottom" open={open} onClose={onClose}>
            <Box sx={{ p: 2 }}>{content}</Box>
        </Drawer>
    );
}
