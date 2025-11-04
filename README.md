<h1 align="center"> Dashboard Analítico para Redes de Restaurantes</h1>

<p align="center">
  Este repositório contém o código-fonte de um <strong>dashboard analítico full-stack</strong> para gerenciamento de restaurantes.
  O sistema combina <strong>React</strong> no frontend, <strong>Node.js (Express)</strong> no backend e <strong>PostgreSQL</strong> como banco de dados.
  Tudo é containerizado via <strong>Docker Compose</strong>, permitindo inicialização completa com um único comando.
</p>

---

<h2> Como Funciona</h2>

<p>O sistema é composto por quatro componentes principais que trabalham em conjunto:</p>

<h3>Frontend (<code>/src</code>)</h3>
<ul>
  <li>Interface web moderna construída com <strong>React</strong>, <strong>Vite</strong> e <strong>TypeScript</strong>.</li>
  <li>UI desenvolvida com <strong>shadcn-ui</strong> e <strong>Tailwind CSS</strong>.</li>
  <li>Exibe dados analíticos em quatro páginas principais:
    <ul>
      <li><strong>Vendas</strong> (Visão Geral)</li>
      <li><strong>Produtos</strong></li>
      <li><strong>Clientes</strong></li>
      <li><strong>Operacional</strong></li>
    </ul>
  </li>
  <li>Utiliza <strong>Recharts</strong> para gráficos e <strong>React Query</strong> para gerenciamento de estado da API.</li>
  <li>Servido por um contêiner <strong>Nginx</strong>, que também atua como proxy reverso para o backend.</li>
</ul>

<h3> Backend (<code>/backend</code>)</h3>
<ul>
  <li>API RESTful desenvolvida em <strong>Node.js</strong> com <strong>Express.js</strong>.</li>
  <li>Conexão com o banco de dados via <strong>Knex.js</strong> (query builder).</li>
  <li>Endpoints disponíveis, como <code>/api/v1/analytics/dashboard</code>, executam consultas SQL complexas (joins, filtros, agregações).</li>
  <li>Rotas separadas para <em>metadados</em> (filtros) e páginas específicas do dashboard.</li>
</ul>

<h3> Banco de Dados (<code>database-schema.sql</code>)</h3>
<ul>
  <li>Banco <strong>PostgreSQL</strong> rodando em contêiner dedicado.</li>
  <li>Schema modelado para operações de restaurante, incluindo tabelas para:
    <strong>sales</strong>, <strong>products</strong>, <strong>customers</strong>, <strong>stores</strong>, <strong>channels</strong> e <strong>payments</strong>.
  </li>
</ul>

<h3> Gerador de Dados (<code>generate_data.py</code>)</h3>
<ul>
  <li>Script em <strong>Python</strong> que utiliza <strong>Faker</strong> e <strong>psycopg2</strong> para gerar dados realistas e massivos.</li>
  <li>Popula o banco com lojas, produtos, clientes e vendas (com padrões sazonais e horários de pico).</li>
  <li>Executado como serviço separado no Docker Compose para inicializar o banco automaticamente.</li>
</ul>

---

<h2> Como Usar</h2>

<h3> Pré-requisitos</h3>
<ul>
  <li><a href="https://www.docker.com/">Docker</a></li>
  <li><a href="https://docs.docker.com/compose/">Docker Compose</a> (geralmente incluído no Docker Desktop)</li>
</ul>

<h3> Passo a Passo (Docker)</h3>

<ol>
  <li><strong>Clone o Repositório</strong><br>
    <pre><code>git clone https://github.com/seuusuario/nola-dashboard.git
cd nola-dashboard
</code></pre>
  </li>

  <li><strong>Construa e Inicie os Contêineres</strong><br>
    Abra o terminal na raiz do projeto e execute:
    <pre><code>docker-compose up -d --build</code></pre>
    Isso irá construir as imagens do frontend e backend, além de iniciar os serviços <code>postgres</code>, <code>backend</code> e <code>frontend</code>.
  </li>

  <li><strong>Popule o Banco de Dados</strong><br>
    O banco é iniciado vazio. Para gerar dados de exemplo, execute o serviço gerador:
    <pre><code>docker-compose run --rm data-generator</code></pre>
    <em>Nota:</em> Este serviço é definido com <code>profiles: [tools]</code> no <code>docker-compose.yml</code>, por isso deve ser executado manualmente.
  </li>

  <li><strong>Acesse o Dashboard</strong><br>
    Após os dados serem gerados, acesse o sistema em:<br>
     <a href="http://localhost:8081" target="_blank">http://localhost:8081</a>
  </li>
</ol>

---

<h2> Tecnologias Utilizadas</h2>

<h3>Frontend</h3>
<ul>
  <li>React</li>
  <li>Vite</li>
  <li>TypeScript</li>
  <li>Tailwind CSS</li>
  <li>shadcn-ui</li>
  <li>Recharts (gráficos)</li>
  <li>React Query (gerenciamento de API)</li>
  <li>React Router (roteamento)</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>Knex.js (Query Builder)</li>
  <li>pg (Driver PostgreSQL)</li>
</ul>

<h3>Banco de Dados</h3>
<ul>
  <li>PostgreSQL</li>
</ul>

<h3>Geração de Dados</h3>
<ul>
  <li>Python</li>
  <li>Faker</li>
  <li>psycopg2</li>
</ul>

<h3>DevOps</h3>
<ul>
  <li>Docker & Docker Compose</li>
  <li>Nginx (Servidor Web & Proxy Reverso)</li>
</ul>

---

