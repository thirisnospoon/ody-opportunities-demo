// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Box, Button, Stack } from "@mui/material";
import EventsPage from "./pages/EventsPage.jsx";
import CompaniesPage from "./pages/CompaniesPage.jsx";

function NavButton({ to, active, children }) {
    return (
        <Button
            component={Link}
            to={to}
            size="small"
            disableElevation
            variant={active ? "contained" : "outlined"}
            sx={{
                borderRadius: 999,
                px: 2,
                borderColor: (t) => (active ? "transparent" : t.palette.divider),
                ...(active
                    ? {
                        color: "#fff",
                        background:
                            "linear-gradient(90deg, rgba(80,70,255,1) 0%, rgba(0,188,212,1) 100%)",
                        boxShadow: (t) => t.shadows[3],
                    }
                    : {
                        color: (t) => t.palette.text.primary,
                        backgroundColor: (t) => t.palette.background.paper,
                        ":hover": { borderColor: (t) => t.palette.text.secondary },
                    }),
            }}
        >
            {children}
        </Button>
    );
}

function TopNav() {
    const { pathname } = useLocation();
    const isEvents = pathname === "/" || pathname.startsWith("/events");
    const isCompanies = pathname.startsWith("/companies");

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: (t) => t.palette.background.paper,
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
            }}
        >
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Business Intelligence Explorer
                </Typography>
                <Stack direction="row" spacing={1}>
                    <NavButton to="/" active={isEvents}>
                        Events
                    </NavButton>
                    <NavButton to="/companies" active={isCompanies}>
                        Companies
                    </NavButton>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Box sx={{ minHeight: "100vh", bgcolor: (t) => t.palette.background.default }}>
                <TopNav />
                <Container maxWidth="xl" sx={{ py: { xs: 1.25, md: 2 } }}>
                    <Routes>
                        <Route path="/" element={<EventsPage dataFolder="/data" />} />
                        <Route path="/events" element={<Navigate to="/" replace />} />
                        <Route path="/companies" element={<CompaniesPage src="/data/out_companies.json" />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Container>
            </Box>
        </BrowserRouter>
    );
}
