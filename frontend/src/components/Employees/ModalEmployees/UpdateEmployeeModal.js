import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

const UpdateEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated }) => {
  const [formData, setFormData] = useState({
    position: employee.position || "",
    status: employee.status || "Disponível",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      position: employee.position || "",
      status: employee.status || "Disponível",
    });
  }, [employee]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.put(
        `/api/employee/${employee._id}`,
        { status: formData.status },
        getAuthConfig()
      );
      await onEmployeeUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar funcionário");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Atualizar Status do Funcionário</h2>
        <form onSubmit={handleSubmit}>
          <label>Status:</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            disabled={loading}
          >
            <option value="Disponível">Disponível</option>
            <option value="Indisponível">Em Projeto</option>
            <option value="Férias">Férias</option>
            <option value="Licença">Licença</option>
          </select>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UpdateEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  employee: PropTypes.object.isRequired,
  onEmployeeUpdated: PropTypes.func.isRequired,
};

export default UpdateEmployeeModal;