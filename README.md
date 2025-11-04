Projeto: Dashboard Analítico de Restaurante (Nola)

Este repositório contém o código-fonte de um dashboard analítico full-stack para gerenciamento de restaurantes. O projeto utiliza um frontend moderno em React para visualização de dados e um backend em Node.js (Express) para processar e servir os dados a partir de um banco de dados PostgreSQL.

O sistema é totalmente containerizado usando Docker Compose, permitindo que toda a pilha (frontend, backend, banco de dados e um gerador de dados) seja iniciada com um único comando.

Como Funciona

O sistema é composto por quatro componentes principais que trabalham em conjunto:

    Frontend (/src)

        Uma interface web interativa construída com React, Vite e TypeScript.

        Utiliza shadcn-ui e Tailwind CSS para os componentes de UI.

        Exibe dados analíticos em quatro páginas principais: Vendas (Visão Geral), Produtos, Clientes e Operacional.

        Renderiza gráficos e métricas usando Recharts e gerencia o estado da API com React Query.

        É servido por um contêiner Nginx, que também atua como proxy reverso para o backend.

    Backend (/backend)

        Uma API RESTful construída em Node.js e Express.js.

        Conecta-se ao banco de dados PostgreSQL usando o query builder Knex.js.

        Expõe endpoints (ex: /api/v1/analytics/dashboard) que executam consultas SQL complexas (agregações, joins, filtros) para calcular KPIs e preparar dados para os gráficos.

        Fornece rotas separadas para metadados (filtros) e para cada página do dashboard.

    Banco de Dados (database-schema.sql)

        Um banco de dados PostgreSQL rodando em seu próprio contêiner Docker.

        O schema é complexo e modelado para operações de restaurante, incluindo tabelas para sales, products, customers, stores, channels, payments, e mais.

    Gerador de Dados (generate_data.py)

        Um script Python que utiliza as bibliotecas Faker e psycopg2 para gerar dados realistas e massivos.

        Popula o banco de dados PostgreSQL com lojas, produtos, clientes e meses de dados de vendas, incluindo padrões sazonais e horários de pico.

        Este script é executado como um serviço separado no Docker Compose para popular o banco após sua inicialização.

Como Usar

Siga os passos abaixo para configurar e executar o projeto completo usando Docker.

Pré-requisitos

    Docker

    Docker Compose (geralmente incluído na instalação do Docker Desktop)

Guia Passo a Passo (Docker)

    Clone o Repositório Clone este projeto para sua máquina local.

    Construa e Inicie os Contêineres Abra um terminal na raiz do projeto (onde o arquivo docker-compose.yml está localizado) e execute o seguinte comando. Isso irá construir as imagens do frontend e backend e iniciar os serviços postgres, backend e frontend.
    Bash

docker-compose up -d --build

Popule o Banco de Dados O banco de dados iniciará vazio. Para preenchê-lo com dados de exemplo, você deve executar o serviço data-generator. Em um terminal separado (na mesma pasta), rode o comando:
Bash

    docker-compose run --rm data-generator

    Nota: Este serviço é definido com profiles: [tools] no docker-compose.yml, por isso não é iniciado automaticamente. Você deve executá-lo manualmente. O script pode levar alguns minutos para gerar todos os dados.

    Acesse o Dashboard Após os dados serem gerados, a aplicação estará pronta para uso. Abra seu navegador e acesse: http://localhost:8081

Tecnologias Utilizadas

    Frontend:

        React

        Vite

        TypeScript

        Tailwind CSS

        shadcn-ui

        Recharts (Gráficos)

        React Query (Gerenciamento de API)

        React Router (Roteamento)

    Backend:

        Node.js

        Express.js

        Knex.js (Query Builder)

        PostgreSQL (Driver pg)

    Banco de Dados:

        PostgreSQL

    Geração de Dados:

        Python

        Faker

        psycopg2

    DevOps:

        Docker & Docker Compose

        Nginx (Servidor Web & Proxy Reverso)
