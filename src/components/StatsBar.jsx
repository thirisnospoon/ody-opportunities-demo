// components/StatsBar.jsx
import React from "react";
import { Paper, Box, Stack, Chip, Typography } from "@mui/material";

export default function StatsBar({ total, uniqueCompanies, yearsRange = [], aiModelsCount = 0 }) {
    const firstYear = yearsRange[yearsRange.length - 1];
    const lastYear = yearsRange[0];

    return (
        <Paper variant="outlined" sx={{ mb: { xs: 1, md: 2 } }}>
            <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
                <Stack direction="row" spacing={1} rowGap={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 0.5 }}>
                        Results:
                    </Typography>
                    <Chip size="small" label={`${total} events`} />
                    <Chip size="small" label={`${uniqueCompanies} companies`} />
                    {yearsRange.length > 0 && <Chip size="small" label={`Years: ${firstYear}–${lastYear}`} />}
                    <Chip size="small" label={`AI models: ${aiModelsCount}`} />
                </Stack>
            </Box>
        </Paper>
    );
}
