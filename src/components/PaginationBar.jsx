// components/PaginationBar.jsx
import React from "react";
import { Stack, Pagination, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function PaginationBar({
                                          page,
                                          onPageChange,
                                          count,
                                          perPage,
                                          onPerPageChange,
                                          perPageOptions = [12, 24, 48],
                                      }) {
    return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
            <Pagination page={page} count={count} color="primary" onChange={(_e, v) => onPageChange?.(v)} />
            <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Per page</InputLabel>
                <Select value={perPage} label="Per page" onChange={(e) => onPerPageChange?.(Number(e.target.value))}>
                    {perPageOptions.map((n) => (
                        <MenuItem value={n} key={n}>
                            {n}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );
}
