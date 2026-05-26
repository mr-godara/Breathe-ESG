import React, { useMemo, useState } from "react";

import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import Layout from "./components/Layout";

const PAGES = [
    { key: "dashboard", label: "Dashboard" },
    { key: "uploads", label: "Uploads" },
    { key: "reviews", label: "Review Queue" },
];

export default function App() {
    const [activePage, setActivePage] = useState("dashboard");

    const content = useMemo(() => {
        if (activePage === "uploads") {
            return <UploadPage />;
        }
        if (activePage === "reviews") {
            return <ReviewQueuePage />;
        }
        return <DashboardPage />;
    }, [activePage]);

    return (
        <Layout
            pages={PAGES}
            activePage={activePage}
            onNavigate={setActivePage}
        >
            {content}
        </Layout>
    );
}
