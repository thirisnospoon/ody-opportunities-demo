// components/CompaniesToolbar.jsx
import React from "react";
import {
    Paper,
    TextField,
    InputAdornment,
    Typography,
    MenuItem,
    Select,
    FormControl,
    IconButton,
    Tooltip,
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

export default function CompaniesToolbar({
                                             search,
                                             onSearch,
                                             sortBy,
                                             onSortBy,
                                             showFiltersButton,
                                             onOpenFilters,
                                             total,
                                         }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                borderRadius: 3,
                backdropFilter: "saturate(180%) blur(6px)",
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{ mr: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
                Companies <Chip size="small" label={total} />
            </Typography>

            <TextField
                size="small"
                placeholder="Search companies…"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                sx={{ minWidth: 280, flex: 1 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select value={sortBy} onChange={(e) => onSortBy(e.target.value)}>
                    <MenuItem value="name_asc">Name (A → Z)</MenuItem>
                    <MenuItem value="name_desc">Name (Z → A)</MenuItem>
                    <MenuItem value="founded_desc">Founded (newest)</MenuItem>
                    <MenuItem value="founded_asc">Founded (oldest)</MenuItem>
                </Select>
            </FormControl>

            {showFiltersButton && (
                <Tooltip title="Filters">
                    <IconButton onClick={onOpenFilters}>
                        <TuneIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Paper>
    );
}
