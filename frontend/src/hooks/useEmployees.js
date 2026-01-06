import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api"; 

export function useEmployees() {
    const [employees, setEmployees] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();
            
            // 1. Rota de Funcionários
            const resEmp = await fetch(`${API_URL}/employees/`, { headers });
            const dataEmp = await resEmp.json();
            
            // 2. Rota de Dashboard (Sem barra final para bater com o Python)
            const resDash = await fetch(`${API_URL}/employees/dashboard`, { headers });
            
            if (resDash.ok) {
                const dataDash = await resDash.json();
                setEmployees(Array.isArray(dataEmp) ? dataEmp : []);
                setDashboardData(dataDash);
                setDepartments(dataDash.lista_departamentos || []);
            } else {
                setDashboardData({ media_salarial: 0, media_idade: 0, por_departamento: [] });
            }
        } catch (err) {
            console.error("Erro na conexão:", err);
            setDashboardData({ media_salarial: 0, media_idade: 0, por_departamento: [] });
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const saveEmployee = async (employeeData, onSuccess) => {
        const isNew = !employeeData.id;
        const url = isNew ? `${API_URL}/employees/` : `${API_URL}/employees/${employeeData.id}`;
        try {
            const res = await fetch(url, {
                method: isNew ? 'POST' : 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(employeeData)
            });
            if (res.ok) {
                if (onSuccess) onSuccess();
                return true;
            }
            return false;
        } catch (e) { return false; }
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm("Excluir?")) return;
        try {
            await fetch(`${API_URL}/employees/${id}`, { 
                method: 'DELETE', 
                headers: getAuthHeaders() 
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    return { employees, dashboardData, departments, loading, error, fetchData, saveEmployee, deleteEmployee };
}