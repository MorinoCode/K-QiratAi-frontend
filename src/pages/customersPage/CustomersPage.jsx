import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import "./CustomersPage.css";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Camera,
  Loader,
  Upload,
} from "lucide-react";

const CustomersPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [idFiles, setIdFiles] = useState({ front: null, back: null });
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    civil_id: "",
    type: "Regular",
    notes: "",
    nationality: "Kuwaiti",
    gender: "M",
    address: "",
    birth_date: "",
    expiry_date: "",
  });

  const activeBranchId = localStorage.getItem("active_branch_id");
  const activeBranchName =
    localStorage.getItem("active_branch_name") || t("all_branches");

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [searchTerm, activeBranchId, user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const branchQuery =
        user?.role === "store_owner" && activeBranchId
          ? `&branch_id=${activeBranchId}`
          : "";

      const res = await api.get(
        `/customers?search=${searchTerm}${branchQuery}`,
      );
      setCustomers(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFileSelect = async (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    setIdFiles((prev) => ({ ...prev, [side]: file }));
    await processOCR(file);
  };

  const processOCR = async (file) => {
    setIsScanning(true);
    const ocrFormData = new FormData();
    ocrFormData.append("image", file);

    try {
      const res = await api.post("/customers/scan", ocrFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const data = res.data.data;
        setFormData((prev) => ({
          ...prev,
          civil_id: data.civil_id || prev.civil_id,
          full_name: data.full_name || prev.full_name,
          nationality: data.nationality || prev.nationality,
          gender: data.gender ? (data.gender === "F" ? "F" : "M") : prev.gender,
          birth_date: data.birth_date || prev.birth_date,
          expiry_date: data.expiry_date || prev.expiry_date,
          address: data.address || prev.address,
          notes: prev.notes + (prev.notes ? "\n" : "") + "[AI Scanned]",
        }));
        toast.success(t("id_scanned_success"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("scan_failed"));
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) =>
        payload.append(key, formData[key]),
      );

      if (activeBranchId) payload.append("branch_id", activeBranchId);

      if (idFiles.front) payload.append("front_image", idFiles.front);
      if (idFiles.back) payload.append("back_image", idFiles.back);

      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("customer_updated_success"));
      } else {
        await api.post("/customers/add", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("customer_added_success"));
      }

      setIsFormOpen(false);
      setFormData({
        full_name: "",
        phone: "",
        civil_id: "",
        type: "Regular",
        notes: "",
        nationality: "Kuwaiti",
        gender: "M",
        address: "",
        birth_date: "",
        expiry_date: "",
      });
      setIdFiles({ front: null, back: null });
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || t("error_saving_customer"));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t("confirm_delete_customer"))) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
      toast.success(t("customer_deleted_success"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("delete_failed"));
    }
  };

  const openEdit = (customer, e) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.full_name,
      phone: customer.phone,
      civil_id: customer.civil_id || "",
      type: customer.type || "Regular",
      notes: customer.notes || "",
      nationality: customer.nationality || "",
      gender: customer.gender || "M",
      address: customer.address || "",
      birth_date: customer.birth_date || "",
      expiry_date: customer.expiry_date || "",
    });
    setIdFiles({ front: null, back: null });
    setIsFormOpen(true);
  };

  return (
    <div className={`customers-page customers-page--${theme}`}>
      <header className="customers-page__header">
        <div className="customers-page__titles">
          <h1 className="customers-page__title">
            <Users className="customers-page__title-icon" size={24} /> 
            {t("customer_management")}
          </h1>
          <p className="customers-page__subtitle">{activeBranchName}</p>
        </div>
        <div className="customers-page__actions">
          <button
            className="customers-page__btn customers-page__btn--primary"
            onClick={() => {
              setSelectedCustomer(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={18} /> {t("new_customer")}
          </button>
        </div>
      </header>

      <div className="customers-page__controls">
        <div className="customers-search">
          <Search size={18} className="customers-search__icon" />
          <input
            className="customers-search__input"
            placeholder={t("search_customer_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-table-container">
        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead className="customers-table__head">
              <tr>
                <th>{t("name")}</th>
                <th>{t("phone")}</th>
                <th>{t("civil_id")}</th>
                <th>{t("type")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="customers-table__body">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="customers-table__row"
                >
                  <td
                    className="customers-table__cell customers-table__cell--name"
                    data-label={t("name")}
                  >
                    {c.full_name}
                  </td>
                  <td className="customers-table__cell" data-label={t("phone")}>
                    {c.phone}
                  </td>
                  <td className="customers-table__cell" data-label={t("civil_id")}>
                    {c.civil_id || "-"}
                  </td>
                  <td className="customers-table__cell" data-label={t("type")}>
                    <span
                      className={`customers-badge customers-badge--${c.type.toLowerCase()}`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td
                    className="customers-table__cell customers-table__cell--actions"
                    data-label={t("actions")}
                  >
                    <div className="customers-table__actions-group">
                      <button
                        className="customers-action-btn"
                        title={t("edit")}
                        onClick={(e) => openEdit(c, e)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="customers-action-btn customers-action-btn--delete"
                        title={t("delete")}
                        onClick={(e) => handleDelete(c.id, e)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="customers-table__empty">
                    {t("no_customers_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="customers-modal-overlay">
          <div className={`customers-modal customers-modal--${theme}`}>
            <div className="customers-modal__header">
              <h3 className="customers-modal__title">
                {selectedCustomer ? t("edit_customer") : t("new_customer_scan")}
              </h3>
              <button
                className="customers-modal__close"
                onClick={() => setIsFormOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="customers-scan">
              <p className="customers-scan__label">{t("upload_civil_id")}</p>
              <div className="customers-scan__buttons">
                <input
                  type="file"
                  ref={frontInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "front")}
                />
                <button
                  type="button"
                  className={`customers-scan__btn ${idFiles.front ? "customers-scan__btn--done" : ""}`}
                  onClick={() => frontInputRef.current.click()}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader className="customers-spin" size={18} />
                  ) : (
                    <Camera size={18} />
                  )}
                  {idFiles.front ? t("front_uploaded") : t("scan_front")}
                </button>

                <input
                  type="file"
                  ref={backInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "back")}
                />
                <button
                  type="button"
                  className={`customers-scan__btn ${idFiles.back ? "customers-scan__btn--done" : ""}`}
                  onClick={() => backInputRef.current.click()}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader className="customers-spin" size={18} />
                  ) : (
                    <Upload size={18} />
                  )}
                  {idFiles.back ? t("back_uploaded") : t("scan_back")}
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="customers-form">
              <input
                className="customers-form__input"
                placeholder={t("full_name")}
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />

              <div className="customers-form__row">
                <input
                  className="customers-form__input"
                  placeholder={t("phone")}
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  className="customers-form__input"
                  placeholder={t("civil_id")}
                  value={formData.civil_id}
                  onChange={(e) =>
                    setFormData({ ...formData, civil_id: e.target.value })
                  }
                />
              </div>

              <div className="customers-form__row">
                <select
                  className="customers-form__input"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="M">{t("male")}</option>
                  <option value="F">{t("female")}</option>
                </select>
                <input
                  className="customers-form__input"
                  placeholder={t("nationality")}
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                />
              </div>

              <div className="customers-form__row">
                <input
                  className="customers-form__input"
                  placeholder={t("birth_date")}
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
                <input
                  className="customers-form__input"
                  placeholder={t("expiry_date")}
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                />
              </div>

              <input
                className="customers-form__input"
                placeholder={t("address")}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <select
                className="customers-form__input"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Wholesaler">Wholesaler</option>
              </select>

              <textarea
                className="customers-form__input customers-form__input--textarea"
                placeholder={t("notes")}
                rows="2"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />

              <button
                type="submit"
                className="customers-page__btn customers-page__btn--submit"
                disabled={isScanning}
              >
                {isScanning ? t("wait_ai") : t("save_customer")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;