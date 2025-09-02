Sudoeste Fight App - Aplicativo da Academia
Este é o repositório oficial do aplicativo móvel para os alunos da academia Sudoeste Fight. O projeto foi desenvolvido como uma solução full-stack, incluindo um aplicativo mobile (frontend), um servidor (backend) e um banco de dados relacional.

✨ Funcionalidades Implementadas
Autenticação de Alunos: Login seguro utilizando o número de matrícula.

Perfil do Aluno: Visualização de dados como nome, modalidade, tempo de treino e graduação.

Upload de Foto de Perfil: Os alunos podem personalizar seus perfis enviando uma foto da galeria do celular.

Agenda de Aulas Dinâmica: A grade de horários é carregada diretamente do banco de dados e pode ser filtrada por dia da semana.

Sistema de Check-in Interativo:

Alunos podem clicar em uma aula para ver mais detalhes.

É possível fazer e cancelar o check-in para as aulas do dia.

A lista de alunos que já fizeram check-in é visível para os outros.

🚀 Tecnologias Utilizadas
Frontend (Mobile App):

React Native com Expo

React Navigation para gerenciamento de telas

Axios para comunicação com a API

React Context API para gerenciamento de estado global (autenticação)

Expo Image Picker para acesso à galeria de imagens

Backend (Servidor):

Node.js com Express.js

PostgreSQL como banco de dados

node-postgres (pg) para a conexão com o banco

Multer para o upload de arquivos (fotos de perfil)

CORS para permitir a comunicação entre frontend e backend

Banco de Dados:

PostgreSQL

⚙️ Como Rodar o Projeto Localmente
Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento na sua máquina.

Pré-requisitos
Node.js e npm

Git

PostgreSQL: Um servidor PostgreSQL instalado e rodando. Baixe aqui

Expo Go App: Instalado no seu celular (Android ou iOS).

1. Configuração do Backend e Banco de Dados
Primeiro, vamos preparar o servidor e o banco de dados.

Clone o repositório:

git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
cd SEU-REPOSITORIO

Navegue até a pasta do backend e instale as dependências:

cd backend
npm install

Configure o Banco de Dados:

Crie um novo banco de dados no seu PostgreSQL com o nome academia.

Abra o arquivo backend/db.js e atualize as credenciais de conexão (usuário, senha, host, porta) para corresponderem à sua configuração local do PostgreSQL.

Crie as Tabelas:

No seu cliente PostgreSQL (como o pgAdmin), execute os scripts SQL abaixo para criar as tabelas necessárias:

-- Tabela de Alunos
CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    modalidade VARCHAR(50),
    tempo_treino VARCHAR(50),
    graduacao VARCHAR(50),
    foto_url VARCHAR(255)
);

-- Tabela de Aulas
CREATE TABLE aulas (
    id SERIAL PRIMARY KEY,
    dia_semana VARCHAR(3) NOT NULL,
    horario VARCHAR(5) NOT NULL,
    modalidade VARCHAR(100) NOT NULL
);

-- Tabela de Check-ins
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
    aula_id INTEGER REFERENCES aulas(id) ON DELETE CASCADE,
    data_checkin DATE NOT NULL,
    UNIQUE(aluno_id, aula_id, data_checkin)
);

Popule os Dados (Opcional, mas recomendado):

Insira pelo menos um aluno de teste e as aulas para que o app funcione.

Inicie o servidor backend:

node index.js

Se tudo estiver correto, você verá a mensagem: ✅ Servidor rodando em http://localhost:3000.

2. Configuração do Frontend (Aplicativo)
Com o backend rodando, vamos configurar o app.

Abra um novo terminal.

Navegue até a pasta do frontend e instale as dependências:

cd sudoestefightapp
npm install

⚠️ Passo Crítico: Configure o IP do Servidor:

Encontre o endereço de IP local da sua máquina (no Windows, use ipconfig; no Mac/Linux, ifconfig).

Abra os seguintes arquivos e atualize a constante API_URL com o seu IP:

telas/TelaLogin.js

telas/TelaAgenda.js

componentes/BarraLateral.js

Exemplo: const API_URL = "http://192.168.100.5:3000";

Inicie o servidor de desenvolvimento do Expo:

npx expo start

3. Executando o Aplicativo
Garanta que seu servidor backend e o servidor do Expo estejam rodando.

Garanta que seu celular esteja conectado na mesma rede Wi-Fi que o seu computador.

Abra o aplicativo Expo Go no seu celular e escaneie o QR Code que apareceu no terminal do Expo.

O aplicativo será carregado no seu celular, pronto para uso!
