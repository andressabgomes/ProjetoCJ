import { BrowserRouter as Router, Routes, Route } from "react-router";
import Layout from "@/react-app/components/Layout";
import Dashboard from "@/react-app/pages/Dashboard";
import Team from "@/react-app/pages/Team";
import Customers from "@/react-app/pages/Customers";
import Support from "@/react-app/pages/Support";
import Analytics from "@/react-app/pages/Analytics";
import Settings from "@/react-app/pages/Settings";
import Inbox from "@/react-app/pages/Inbox";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/support" element={<Support />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
