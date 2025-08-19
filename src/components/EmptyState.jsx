import React from "react";
import { Paper, Box, Typography } from "@mui/material";

export default function EmptyState({ title, subtitle }) {
    return (
        <Paper variant="outlined">
            <Box p={4} textAlign="center">
                <Typography variant="h6">{title}</Typography>
                {subtitle && (
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}
