-- Cria o banco de dados
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'RH_Database')
BEGIN
CREATE DATABASE RH_Database;
END
GO

-- Seleciona o banco para uso
USE RH_Database;
GO

-- 1. Cria a tabela de Departamentos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='departments' AND xtype='U')
BEGIN
    CREATE TABLE departments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nome VARCHAR(50) UNIQUE NOT NULL
    );
END
GO

-- 2. Cria a tabela de Funcionários (employees)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='employees' AND xtype='U')
BEGIN
    CREATE TABLE employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cargo VARCHAR(100) NOT NULL,
        dept VARCHAR(50) NOT NULL,
        salario FLOAT NOT NULL,
        status VARCHAR(20) DEFAULT 'Ativo',
        idade INT DEFAULT 25
    );
END
GO

-- 3. Insere dados iniciais
IF NOT EXISTS (SELECT * FROM employees)
INSERT INTO employees (nome, cargo, dept, salario, status, idade) VALUES 
('Ana Souza', 'Gerente de Projetos', 'TI', 12000, 'Ativo', 34),
('Carlos Lima', 'Desenvolvedor Frontend', 'TI', 6500, 'Ativo', 28),
('Beatriz Silva', 'Analista de RH', 'RH', 4800, 'Ativo', 29),
('Jorge Mendes', 'Coordenador Financeiro', 'Financeiro', 9000, 'Ativo', 41),
('Mariana Dias', 'UX Designer', 'TI', 7200, 'Ativo', 31),
('Pedro Alvares', 'Assistente Administrativo', 'Operações', 2500, 'Ativo', 22),
('Fernanda Torres', 'Diretora Comercial', 'Comercial', 18000, 'Ativo', 45),
('Lucas Pereira', 'Estagiário de Dev', 'TI', 1800, 'Ativo', 20),
('Juliana Costa', 'Analista Contábil', 'Financeiro', 5200, 'Férias', 38),
('Roberto Alves', 'Vendedor Sênior', 'Comercial', 7500, 'Ativo', 36);
GO

SELECT * FROM employees;

DROP TABLE employees;
