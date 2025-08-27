// components/EventsToolbar.jsx
import React from "react";
import {
    Paper,
    Box,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

export default function EventsToolbar({
                                          search,
                                          onSearch,
                                          sortBy,
                                          onSortBy,
                                          showFiltersButton = false,
                                          onOpenFilters,
                                      }) {
    return (
        <Paper variant="outlined" sx={{ mb: 2 }}>
            <Box p={2}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    useFlexGap
                    flexWrap="nowrap"
                >
                    {showFiltersButton && (
                        <IconButton
                            color="primary"
                            size="small"
                            aria-label="Open filters"
                            onClick={onOpenFilters}
                            sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                        >
                            <TuneIcon fontSize="small" />
                        </IconButton>
                    )}

                    <TextField
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 180, width: { xs: "100%", sm: "auto" } }}
                        value={search}
                        onChange={(e) => onSearch?.(e.target.value)}
                        placeholder="Search…"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl
                        size="small"
                        sx={{
                            minWidth: { xs: "100%", sm: 180 },
                            width: { xs: "100%", sm: "auto" },
                        }}
                    >
                        <InputLabel id="sort-by-label">Sort</InputLabel>
                        <Select
                            labelId="sort-by-label"
                            value={sortBy}
                            label="Sort"
                            onChange={(e) => onSortBy?.(e.target.value)}
                        >
                            <MenuItem value="year_desc">Newest year</MenuItem>
                            <MenuItem value="title_asc">Title A–Z</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Box>
        </Paper>
    );
}
