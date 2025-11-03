# Usar uma imagem Node.js 18
FROM node:18-alpine

# Definir o diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta que o app vai rodar
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]