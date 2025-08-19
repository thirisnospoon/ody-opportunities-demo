import React, { useMemo } from "react";
import { Tabs, Tab, Chip, Box } from "@mui/material";

export default function IndustryTabs({ industries = [], counts = {}, value, onChange }) {
    // Build list with counts; active first (>0), then inactive (0)
    const ordered = useMemo(() => {
        const names = ["All", ...industries];
        const withCounts = names.map((n) => ({ name: n, cnt: counts?.[n] ?? 0 }));
        const active = withCounts.filter((x) => x.cnt > 0);
        const inactive = withCounts.filter((x) => x.cnt === 0);
        return [...active, ...inactive];
    }, [industries, counts]);

    const handle = (_e, v) => onChange?.(v);

    return (
        <Tabs
            value={value}
            onChange={handle}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Industry tabs"
            sx={{ minHeight: 40 }}
        >
            {ordered.map(({ name, cnt }) => {
                const disabled = cnt === 0;
                return (
                    <Tab
                        key={name}
                        value={name}
                        disabled={disabled}
                        sx={{
                            minHeight: 40,
                            px: 1,
                            textTransform: "none",
                        }}
                        label={
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                                <span style={{ fontSize: 13 }}>{name}</span>
                                <Chip
                                    size="small"
                                    label={cnt}
                                    color={disabled ? "default" : "primary"}
                                    variant={disabled ? "outlined" : "filled"}
                                />
                            </Box>
                        }
                    />
                );
            })}
        </Tabs>
    );
}
