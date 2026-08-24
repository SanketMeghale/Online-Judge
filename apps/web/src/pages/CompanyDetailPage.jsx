import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompanyDetailSheet from "../components/company/CompanyDetailSheet.jsx";

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%", maxWidth: "100%", padding: "0 0 32px 0" }}>
      <CompanyDetailSheet
        companyId={companyId || "google"}
        onBack={() => navigate("/ai-coach?tab=companies")}
      />
    </div>
  );
}
