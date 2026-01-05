import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// URL da API: Tenta ler do .env, senão usa o localhost
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export function useEmployees() {
    // Estados de Dados
    const [employees, setEmployees] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [departments, setDepartments] = useState([]);
    
    // Estados de Controle
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- AÇÃO 1: BUSCAR DADOS (Fetch) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const resEmp = await fetch(`${API_URL}/employees`);
            if (!resEmp.ok) throw new Error("Erro ao buscar funcionários");
            const dataEmp = await resEmp.json();
            
            const resDash = await fetch(`${API_URL}/dashboard`);
            if (!resDash.ok) throw new Error("Erro ao buscar dashboard");
            const dataDash = await resDash.json();

            // Atualiza estados
            setEmployees(dataEmp);
            setDashboardData(dataDash);

            if (dataDash.lista_departamentos?.length > 0) {
                setDepartments(dataDash.lista_departamentos);
            } else {
                setDepartments(['TI', 'RH', 'Financeiro', 'Comercial']);
            }
            
            setError('');
        } catch (err) {
            console.error(err);
            toast.error("Falha de conexão com o servidor Python.");
            setError("Sistema Offline - Verifique o servidor.");
        } finally {
            setLoading(false);
        }
    }, []);

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchData(); // Recarrega os dados
                toast.success("Salvo com sucesso!", { id: toastId });
                if (onSuccess) onSuccess(); // Fecha o modal via callback
                return true;
            } else {
                toast.error("Erro ao salvar.", { id: toastId });
                return false;
            }
        } catch (err) {
            toast.error("Erro de conexão.", { id: toastId });
            return false;
        }
    };

    // --- AÇÃO 3: DELETAR ---
    const deleteEmployee = async (id) => {
        if (window.confirm("Tem certeza que deseja remover este funcionário?")) {
            const toastId = toast.loading('Removendo...');
            try {
                const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
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

    // Retorna tudo que o App precisa usar
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