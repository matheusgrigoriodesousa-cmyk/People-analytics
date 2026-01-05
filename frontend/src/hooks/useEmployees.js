import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// --- CONFIGURAÇÃO DE URL BLINDADA (PARA O HOOK) ---
// 1. Pega a URL do .env ou do Render
const RAW_URL = process.env.REACT_APP_API_URL || "https://people-analytics-api-jba6.onrender.com/api";

// 2. SEGURANÇA: Remove "/api" do fim se tiver e adiciona de novo
// Garante que sempre termine em ".../api"
const BASE_URL = RAW_URL.replace(/\/api$/, ''); 
const API_URL = `${BASE_URL}/api`;

export function useEmployees() {
    // Estados de Dados
    const [employees, setEmployees] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [departments, setDepartments] = useState([]);
    
    // Estados de Controle
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Função auxiliar para pegar o token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        } : { 
            'Content-Type': 'application/json' 
        };
    };

    // --- AÇÃO 1: BUSCAR DADOS (Fetch) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();
            
            // Log para debug (Aperte F12 para ver se a URL está certa)
            console.log(`Hook buscando em: ${API_URL}/employees`);

            const resEmp = await fetch(`${API_URL}/employees`, { headers });
            if (!resEmp.ok) throw new Error("Erro ao buscar funcionários");
            const dataEmp = await resEmp.json();
            
            const resDash = await fetch(`${API_URL}/dashboard`, { headers });
            if (!resDash.ok) throw new Error("Erro ao buscar dashboard");
            const dataDash = await resDash.json();

            setEmployees(dataEmp);
            setDashboardData(dataDash);

            if (dataDash.lista_departamentos?.length > 0) {
                setDepartments(dataDash.lista_departamentos);
            } else {
                setDepartments(['TI', 'RH', 'Financeiro', 'Comercial', 'Operações', 'Marketing']);
            }
            
            setError('');
        } catch (err) {
            console.error(err);
            // Evita toast repetitivo se já tiver erro na tela
            if (!error) toast.error("Falha na conexão com o servidor.");
            setError("Sistema Offline.");
        } finally {
            setLoading(false);
        }
    }, [error]); // Adicionado error na dependência para evitar loop de toasts

    // --- AÇÃO 2: SALVAR (Create/Update) ---
    const saveEmployee = async (employeeData, onSuccess) => {
        const toastId = toast.loading('Salvando dados...');
        try {
            const payload = { 
                ...employeeData, 
                salario: Number(employeeData.salario),
                idade: Number(employeeData.idade) 
            };
            
            const isNew = !payload.id;
            if (isNew) delete payload.id;

            const url = isNew ? `${API_URL}/employees` : `${API_URL}/employees/${payload.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchData();
                toast.success("Salvo com sucesso!", { id: toastId });
                if (onSuccess) onSuccess(); 
                return true;
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Erro ao salvar.", { id: toastId });
                return false;
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro de conexão.", { id: toastId });
            return false;
        }
    };

    // --- AÇÃO 3: DELETAR ---
    const deleteEmployee = async (id) => {
        if (window.confirm("Tem certeza que deseja remover este funcionário?")) {
            const toastId = toast.loading('Removendo...');
            try {
                const res = await fetch(`${API_URL}/employees/${id}`, { 
                    method: 'DELETE',
                    headers: getAuthHeaders() 
                });
                
                if (res.ok) {
                    await fetchData();
                    toast.success("Removido com sucesso!", { id: toastId });
                } else {
                    toast.error("Erro ao remover.", { id: toastId });
                }
            } catch (e) {
                toast.error("Erro de conexão.", { id: toastId });
            }
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