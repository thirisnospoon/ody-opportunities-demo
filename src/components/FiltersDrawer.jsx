import React from "react";
import {
    Box,
    Stack,
    Divider,
    Typography,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    MenuItem,
    Chip,
    Paper,
    Drawer,
    Button,
    Slider,
    IconButton,
    Tooltip,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const MultiSelect = ({ label, values = [], selected = [], onChange }) => {
    const removeValue = (val) => {
        const next = (selected || []).filter((v) => v !== val);
        onChange?.(next);
    };

    return (
        <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={selected}
                onChange={(e) => onChange?.(e.target.value)}
                input={<OutlinedInput label={label} />}
                renderValue={(vals) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {vals.map((v) => (
                            <Chip
                                key={v}
                                label={v}
                                size="small"
                                onDelete={() => removeValue(v)}
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                        ))}
                    </Box>
                )}
                MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
            >
                {values.map((v) => (
                    <MenuItem key={v} value={v}>
                        {v}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

function MarksRange({ value = [0, 10], onChange, defaultRange = [0, 10], onReset }) {
    const [min, max] = value;
    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                    Opportunity mark
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                        {min}–{max}
                    </Typography>
                    <Tooltip title="Reset to default">
                        <IconButton size="small" onClick={onReset}>
                            <RestartAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
            <Slider
                value={value}
                step={1}
                min={defaultRange[0]}
                max={defaultRange[1]}
                onChange={(_e, v) => onChange?.(v)}
                valueLabelDisplay="auto"
            />
        </Box>
    );
}

function FiltersContent({ facets = {}, selected = {}, onChange = {}, onResetMarks }) {
    const defaultRange = facets.marksRange || [0, 10];

    return (
        <Box p={2}>
            <Stack spacing={2}>
                <Typography variant="h6">Filters</Typography>

                <MarksRange
                    value={selected.marksRange || defaultRange}
                    onChange={onChange.marksRange}
                    defaultRange={defaultRange}
                    onReset={onResetMarks}
                />

                <Divider />

                <MultiSelect
                    label="Tags"
                    values={facets.tags || []}
                    selected={selected.tags || []}
                    onChange={onChange.tags}
                />
                <MultiSelect
                    label="Year"
                    values={(facets.years || []).map(String)}
                    selected={(selected.years || []).map(String)}
                    onChange={(vals) => onChange.years?.(vals.map(Number))}
                />
                <MultiSelect
                    label="Company"
                    values={facets.companies || []}
                    selected={selected.companies || []}
                    onChange={onChange.companies}
                />
                <MultiSelect
                    label="Companies mentioned"
                    values={facets.mentioned || []}
                    selected={selected.mentioned || []}
                    onChange={onChange.mentioned}
                />
                <MultiSelect
                    label="Source origin"
                    values={facets.origins || []}
                    selected={selected.origins || []}
                    onChange={onChange.origins}
                />

                <Divider />

                <MultiSelect
                    label="AI model"
                    values={facets.ai_models || []}
                    selected={selected.aiModels || []}
                    onChange={onChange.aiModels}
                />
                <MultiSelect
                    label="Model type"
                    values={facets.ai_types || []}
                    selected={selected.aiTypes || []}
                    onChange={onChange.aiTypes}
                />

                <Divider />
                <Typography color="text.secondary" variant="body2">
                    Tabs filter by industry. Other filters stack.
                </Typography>
            </Stack>
        </Box>
    );
}

export default function FiltersDrawer({
                                          facets = {},
                                          selected = {},
                                          onChange = {},
                                          onResetMarks = () => {},
                                          permanent = false,
                                          width = { md: 360 },
                                          open = false,
                                          onClose = () => {},
                                      }) {
    if (permanent) {
        // Desktop/tablet sidebar
        return (
            <Paper variant="outlined" sx={{ width, position: "sticky", top: 16 }}>
                <FiltersContent
                    facets={facets}
                    selected={selected}
                    onChange={onChange}
                    onResetMarks={onResetMarks}
                />
            </Paper>
        );
    }

    // Mobile bottom sheet
    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    maxHeight: "80vh",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                },
            }}
        >
            <FiltersContent
                facets={facets}
                selected={selected}
                onChange={onChange}
                onResetMarks={onResetMarks}
            />
            <Box p={2} pt={0} display="flex" justifyContent="flex-end">
                <Button onClick={onClose}>Close</Button>
            </Box>
        </Drawer>
    );
}
