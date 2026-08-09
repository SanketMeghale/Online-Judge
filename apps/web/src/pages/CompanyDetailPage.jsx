import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompanyDetailSheet from "../components/company/CompanyDetailSheet.jsx";

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px 24px 48px", maxWidth: "1400px", margin: "0 auto" }}>
      <CompanyDetailSheet
        companyId={companyId || "google"}
        onBack={() => navigate("/ai-coach?tab=companies")}
      />
    </div>
  );
}
