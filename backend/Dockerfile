# Use uma imagem oficial do Node.js
FROM node:18

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie os arquivos de dependências para o container
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do backend para o container
COPY . .

# Exponha a porta do backend
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
