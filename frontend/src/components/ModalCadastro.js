import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod'; // O validador
import { zodResolver } from '@hookform/resolvers/zod'; // A ponte entre Zod e React Hook Form
import '../App.css'; 

// 1. DEFINIÇÃO DAS REGRAS (SCHEMA)
// Aqui é onde a mágica acontece. O Zod garante que os dados sigam esse padrão.
const employeeSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 letras").nonempty("Nome é obrigatório"),
  email: z.string().email("Digite um e-mail válido").nonempty("E-mail é obrigatório"),
  dept: z.string().nonempty("Selecione um departamento"),
  cargo: z.string().min(2, "Cargo inválido").nonempty("Cargo é obrigatório"),
  salario: z.number({ invalid_type_error: "Salário deve ser número" })
            .min(1320, "O salário não pode ser menor que o mínimo (R$ 1320)")
            .positive("Salário deve ser positivo"),
  idade: z.number({ invalid_type_error: "Idade inválida" })
          .min(18, "Proibido trabalho infantil (mín 18 anos)")
          .max(100, "Idade inválida"),
  // id é opcional pois só existe na edição
  id: z.number().optional()
});

const ModalCadastro = ({ onClose, onSave, departments, employeeToEdit }) => {
  
  // 2. CONFIGURAÇÃO DO FORMULÁRIO
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    reset 
  } = useForm({
    resolver: zodResolver(employeeSchema), // Conecta o Zod
    defaultValues: {
      nome: '', email: '', dept: '', cargo: '', salario: 0, idade: 0
    }
  });

  // 3. PREENCHER DADOS NA EDIÇÃO
  useEffect(() => {
    if (employeeToEdit) {
      // Preenche os campos automaticamente
      Object.keys(employeeToEdit).forEach(key => {
        setValue(key, employeeToEdit[key]);
      });
    } else {
      reset(); // Limpa se for novo cadastro
    }
  }, [employeeToEdit, setValue, reset]);

  // 4. FUNÇÃO DE ENVIO (Só é chamada se o Zod aprovar)
  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h3>{employeeToEdit ? '✏️ Editar Funcionário' : '✨ Novo Funcionário'}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* NOME & EMAIL */}
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                {...register("nome")} // Conecta o input ao hook
                placeholder="Ex: João Silva" 
              />
              {errors.nome && <span className="error-text">{errors.nome.message}</span>}
            </div>

            <div className="form-group">
              <label>E-mail Corporativo</label>
              <input 
                {...register("email")} 
                placeholder="joao@empresa.com" 
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>
          </div>

          {/* DEPARTAMENTO & CARGO */}
          <div className="form-row">
            <div className="form-group">
              <label>Departamento</label>
              <select {...register("dept")}>
                <option value="">Selecione...</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.dept && <span className="error-text">{errors.dept.message}</span>}
            </div>

            <div className="form-group">
              <label>Cargo</label>
              <input {...register("cargo")} placeholder="Ex: Analista" />
              {errors.cargo && <span className="error-text">{errors.cargo.message}</span>}
            </div>
          </div>

          {/* SALÁRIO & IDADE */}
          <div className="form-row">
            <div className="form-group">
              <label>Salário (R$)</label>
              <input 
                type="number" 
                step="0.01"
                {...register("salario", { valueAsNumber: true })} // Converte string pra number auto
              />
              {errors.salario && <span className="error-text">{errors.salario.message}</span>}
            </div>

            <div className="form-group">
              <label>Idade</label>
              <input 
                type="number"
                {...register("idade", { valueAsNumber: true })} 
              />
              {errors.idade && <span className="error-text">{errors.idade.message}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">
              {employeeToEdit ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCadastro;