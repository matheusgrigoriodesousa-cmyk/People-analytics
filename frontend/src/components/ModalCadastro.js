import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Gerencia o estado do formulário (valores, erros, envio)
import { z } from 'zod'; // Biblioteca de validação (cria as regras)
import { zodResolver } from '@hookform/resolvers/zod'; // Conecta o Zod ao React Hook Form
import '../App.css'; 

// ============================================================================
// BLOCO 1: DEFINIÇÃO DO SCHEMA DE VALIDAÇÃO (ZOD)
// ============================================================================
// Aqui definimos as "regras do jogo". O formulário só será enviado se
// os dados passarem por todas essas verificações.
const employeeSchema = z.object({
  // Validação de Texto (String)
  nome: z.string()
         .min(3, "O nome deve ter pelo menos 3 letras") // Erro se for muito curto
         .nonempty("Nome é obrigatório"),               // Erro se estiver vazio

  // Validação de E-mail (formato automático)
  email: z.string()
          .email("Digite um e-mail válido") // Verifica @ e domínio
          .nonempty("E-mail é obrigatório"),

  dept: z.string().nonempty("Selecione um departamento"), // Obrigatório selecionar no <select>

  cargo: z.string()
          .min(2, "Cargo inválido")
          .nonempty("Cargo é obrigatório"),

  // Validação de Números
  // 'invalid_type_error' aparece se o usuário tentar digitar letras num campo numérico (ou o HTML não converter)
  salario: z.number({ invalid_type_error: "Salário deve ser número" })
            .min(1320, "O salário não pode ser menor que o mínimo (R$ 1320)") // Regra de negócio
            .positive("Salário deve ser positivo"),

  idade: z.number({ invalid_type_error: "Idade inválida" })
          .min(18, "Proibido trabalho infantil (mín 18 anos)") // Regra legal
          .max(100, "Idade inválida"),

  // Campo Opcional: ID só existe na Edição, na Criação ele não vem.
  id: z.number().optional()
});

// ============================================================================
// BLOCO 2: COMPONENTE E CONFIGURAÇÃO DO HOOK
// ============================================================================
const ModalCadastro = ({ onClose, onSave, departments, employeeToEdit }) => {
  
  // Inicializa o useForm. É aqui que conectamos o validador Zod.
  const { 
    register,     // Função para "registrar" os inputs (conectar input -> hook)
    handleSubmit, // Função que gerencia o submit (valida antes de enviar)
    formState: { errors }, // Objeto que guarda os erros de validação atuais
    setValue,     // Função para preencher campos manualmente (usado na edição)
    reset         // Função para limpar o formulário
  } = useForm({
    resolver: zodResolver(employeeSchema), // <--- A MÁGICA: Conecta o Zod aqui
    defaultValues: {
      nome: '', email: '', dept: '', cargo: '', salario: 0, idade: 0
    }
  });

  // ============================================================================
  // BLOCO 3: PREENCHIMENTO AUTOMÁTICO (EFEITO DE EDIÇÃO)
  // ============================================================================
  // Este useEffect roda sempre que o modal abre ou 'employeeToEdit' muda.
  useEffect(() => {
    if (employeeToEdit) {
      // MODO EDIÇÃO: Temos um funcionário para editar.
      // O loop percorre cada campo do funcionário (nome, email, etc) e
      // usa o setValue para jogar esse dado dentro do input correspondente.
      Object.keys(employeeToEdit).forEach(key => {
        setValue(key, employeeToEdit[key]);
      });
    } else {
      // MODO CRIAÇÃO: Não tem funcionário (é null).
      // Limpa todos os campos para garantir que não sobrou lixo de uma edição anterior.
      reset(); 
    }
  }, [employeeToEdit, setValue, reset]);

  // ============================================================================
  // BLOCO 4: FUNÇÃO DE SUBMISSÃO
  // ============================================================================
  // Esta função SÓ é chamada pelo handleSubmit se não houver NENHUM erro de validação.
  const onSubmit = (data) => {
    // 'data' já é o objeto limpo e validado (ex: salários já são números, strings sem espaços extras, etc)
    onSave(data); 
  };

  // ============================================================================
  // BLOCO 5: RENDERIZAÇÃO (JSX - O VISUAL)
  // ============================================================================
  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="modal-header">
          {/* Título muda dinamicamente dependendo se é Edição ou Novo */}
          <h3>{employeeToEdit ? '✏️ Editar Funcionário' : '✨ Novo Funcionário'}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {/* FORMULÁRIO */}
        {/* O handleSubmit envolve nossa função onSubmit para garantir a validação antes */}
        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* --- GRUPO 1: DADOS PESSOAIS --- */}
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                {...register("nome")} // O 'register' injeta onChange, onBlur, name e ref aqui
                placeholder="Ex: João Silva" 
              />
              {/* Exibição condicional de erro: Só mostra o span se errors.nome existir */}
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

          {/* --- GRUPO 2: DADOS CORPORATIVOS --- */}
          <div className="form-row">
            <div className="form-group">
              <label>Departamento</label>
              <select {...register("dept")}>
                <option value="">Selecione...</option>
                {/* Mapeia a lista de departamentos recebida via props */}
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

          {/* --- GRUPO 3: NÚMEROS (SALÁRIO E IDADE) --- */}
          <div className="form-row">
            <div className="form-group">
              <label>Salário (R$)</label>
              <input 
                type="number" 
                step="0.01" // Permite centavos
                // valueAsNumber: true força o React Hook Form a tratar isso como número, não string
                {...register("salario", { valueAsNumber: true })} 
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

          {/* RODAPÉ COM BOTÕES */}
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