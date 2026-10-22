import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../../layouts/DashboardLayout";
import { getMyReports } from "../../../services/patientService";

import styles from "./Reports.module.css";

const Reports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyReports();

      if (!data.basarili) {
        setError(data.mesaj || "Raporlarınız getirilemedi.");
        return;
      }

      setReports(data.raporlar || []);
    } catch (err) {
      console.error("Hasta raporları yükleme hatası:", err);

      setError(
        err.response?.data?.mesaj ||
          "Raporlarınız yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const getOrganLabel = (organ) => {
    if (organ === "beyin") return "Beyin";
    if (organ === "bobrek") return "Böbrek";

    return organ || "-";
  };

  const getModelLabel = (model) => {
    if (model === "unet") return "U-Net";
    if (model === "unet_plus") return "U-Net++";

    return model || "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 10 }, (_, index) => currentYear - index);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const reportYear = report.olusturulma_tarihi
        ? new Date(report.olusturulma_tarihi).getFullYear()
        : null;

      const searchValue = search.trim().toLocaleLowerCase("tr-TR");

      const matchesSearch =
        !searchValue ||
        report.analiz_adi?.toLocaleLowerCase("tr-TR").includes(searchValue) ||
        getOrganLabel(report.organ)
          .toLocaleLowerCase("tr-TR")
          .includes(searchValue) ||
        getModelLabel(report.model)
          .toLocaleLowerCase("tr-TR")
          .includes(searchValue);

      const matchesStartYear =
        !startYear || (reportYear && reportYear >= Number(startYear));

      const matchesEndYear =
        !endYear || (reportYear && reportYear <= Number(endYear));

      return matchesSearch && matchesStartYear && matchesEndYear;
    });
  }, [reports, search, startYear, endYear]);

  if (loading) {
    return (
      <DashboardLayout title="Raporlarım">
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <h2>Raporlarınız yükleniyor...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Raporlarım">
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <div className={styles.errorIcon}>!</div>
            <h2>Raporlar alınamadı</h2>
            <p>{error}</p>

            <button
              type="button"
              className={styles.retryButton}
              onClick={loadReports}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Raporlarım">
      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.dateFilters}>
            <div className={styles.filterGroup}>
              <label>Başlangıç Yılı</label>

              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              >
                <option value="">Tümü</option>

                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Bitiş Yılı</label>

              <select
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              >
                <option value="">Tümü</option>

                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.searchBox}>
            <svg
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Raporlarda ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <svg
                width="27"
                height="27"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v6h6M9 13h6M9 17h6"
                />
              </svg>
            </div>

            <h2>Rapor bulunamadı</h2>
          </div>
        ) : (
          <div className={styles.reportList}>
            {filteredReports.map((report) => (
              <div key={report.id} className={styles.reportItem}>
                <div className={styles.reportPreview}>
                  {report.preview_image ? (
                    <img
                      src={report.preview_image}
                      alt={report.analiz_adi || "MR görüntüsü"}
                    />
                  ) : (
                    <svg
                      width="32"
                      height="32"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 21a9 9 0 100-18 9 9 0 000 18zM8 12h8M12 8v8"
                      />
                    </svg>
                  )}
                </div>

                <div className={styles.reportContent}>
                  <h2>{report.analiz_adi || `Analiz #${report.analiz_id}`}</h2>

                  <div className={styles.reportDate}>
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14H3V6a2 2 0 012-2z"
                      />
                    </svg>

                    {formatDate(report.olusturulma_tarihi)}
                  </div>

                  <div className={styles.description}>
                    <strong>Açıklama:</strong> {getOrganLabel(report.organ)}{" "}
                    görüntüleme analizi
                    {" · "}
                    {getModelLabel(report.model)}
                  </div>
                </div>

                <div className={styles.reportActions}>
                  <button
                    type="button"
                    className={styles.openButton}
                    onClick={() => navigate(`/patient/reports/${report.id}`)}
                  >
                    Raporu Aç
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
