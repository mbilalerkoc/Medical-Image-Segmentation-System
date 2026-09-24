import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getPatients } from "../../services/patientService";
import PatientModal from "./components/PatientModal";
import styles from "./PatientList.module.css";

const PatientList = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);

      const data = await getPatients();

      if (data.basarili) {
        setPatients(data.hastalar);
      }
    } catch (error) {
      console.error(
        "Hastalar yüklenirken hata:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowModal(false);
    fetchPatients();
  };

  const handlePatientDetail = (hasta) => {
    navigate(`/patients/${hasta.id}`, {
      state: {
        patient: hasta,
      },
    });
  };

  return (
    <DashboardLayout title="Hastalarım">
      <div className={styles.card}>

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              Kayıtlı Hastalar
            </h2>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={styles.addBtn}
          >
            + Yeni Hasta Ekle
          </button>
        </div>

        {/* TABLO */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>

            <thead>
              <tr>
                <th className={styles.th}>
                  TC Kimlik
                </th>

                <th className={styles.th}>
                  Ad Soyad
                </th>

                <th className={styles.th}>
                  E-posta
                </th>

                <th className={styles.th}>
                  Telefon
                </th>

                <th
                  className={`${styles.th} text-center`}
                >
                  Durum
                </th>

                <th
                  className={`${styles.th} text-right`}
                >
                  İşlem
                </th>
              </tr>
            </thead>

            <tbody>

              {/* YÜKLENİYOR */}
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-slate-400"
                  >
                    Hastalar yükleniyor...
                  </td>
                </tr>
              ) : patients.length === 0 ? (

                /* HASTA YOK */
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-slate-400"
                  >
                    Henüz kayıtlı hasta bulunmuyor.
                  </td>
                </tr>

              ) : (

                /* HASTALAR */
                patients.map((hasta) => (
                  <tr
                    key={hasta.id}
                    className={styles.tr}
                  >

                    <td className={styles.td}>
                      {hasta.tc_kimlik}
                    </td>

                    <td
                      className={styles.td}
                      style={{
                        fontWeight: "600",
                      }}
                    >
                      {hasta.ad} {hasta.soyad}
                    </td>

                    <td className={styles.td}>
                      {hasta.email || "-"}
                    </td>

                    <td className={styles.td}>
                      {hasta.telefon || "-"}
                    </td>

                    <td
                      className={`${styles.td} text-center`}
                    >
                      <span
                        className={
                          hasta.User?.aktif
                            ? styles.badgeActive
                            : styles.badgePending
                        }
                      >
                        {hasta.User?.aktif
                          ? "Aktif"
                          : "Şifre Bekliyor"}
                      </span>
                    </td>

                    <td
                      className={`${styles.td} text-right`}
                    >
                      <button
                        className={styles.detailBtn}
                        onClick={() =>
                          handlePatientDetail(hasta)
                        }
                      >
                        Detay
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>
      </div>

      <PatientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleAddSuccess}
      />

    </DashboardLayout>
  );
};

export default PatientList;