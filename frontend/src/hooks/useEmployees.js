import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// --- CONFIGURAÇÃO DA URL ---
// 1. Pega o domínio do .env (ou usa localhost como fallback)
const ENV_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
// 2. Remove a barra do final se existir (pra evitar //api)
const BASE_URL = ENV_URL.replace(/\/$/, '');
// 3. Monta a URL final da API
const API_URL = `${BASE_URL}/api`; 

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
        setError('');
        try {
            const headers = getAuthHeaders();
            
            // 1. Busca Lista de Funcionários
            // URL Final: https://...onrender.com/api/employees/
            const resEmp = await fetch(`${API_URL}/employees/`, { headers });
            
            // 2. Busca Dados do Dashboard
            // URL Final: https://...onrender.com/api/employees/dashboard
            const resDash = await fetch(`${API_URL}/employees/dashboard`, { headers });
            
            if (resEmp.ok && resDash.ok) {
                const dataEmp = await resEmp.json();
                const dataDash = await resDash.json();

                setEmployees(Array.isArray(dataEmp) ? dataEmp : []);
                setDashboardData(dataDash);
                setDepartments(dataDash.lista_departamentos || []);
            } else {
                // Se der erro (ex: 401), limpa os dados
                console.warn("Falha ao buscar dados (Token expirado?)");
                setEmployees([]);
                setDashboardData({ media_salarial: 0, media_idade: 0, por_departamento: [] });
            }
        } catch (err) {
            console.error("Erro na conexão:", err);
            setError('Erro ao conectar com o servidor.');
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
                toast.success(isNew ? "Funcionário criado!" : "Funcionário atualizado!");
                if (onSuccess) onSuccess();
                fetchData(); // Atualiza a lista e os gráficos automaticamente
                return true;
            } else {
                const errorData = await res.json();
                toast.error(`Erro: ${errorData.detail || "Falha ao salvar"}`);
                return false;
            }
        } catch (e) { 
            toast.error("Erro de conexão ao salvar.");
            return false; 
        }
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este funcionário?")) return;
        
        try {
            const res = await fetch(`${API_URL}/employees/${id}`, { 
                method: 'DELETE', 
                headers: getAuthHeaders() 
            });

            if (res.ok) {
                toast.success("Funcionário excluído.");
                fetchData(); // Atualiza a dashboard
            } else {
                toast.error("Erro ao excluir.");
            }
        } catch (e) { 
            console.error(e); 
            toast.error("Erro de conexão.");
        }
    };

    return { 
        employees, 
        dashboardData, 
        departments, 
        loading, 
        error, 
        fetchData, 
        saveEmployee, 
        deleteEmployee 
    };
}