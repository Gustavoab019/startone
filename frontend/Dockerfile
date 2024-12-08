# Use uma imagem oficial do Node.js para construir o frontend
FROM node:18 AS build

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie os arquivos de dependências para o container
COPY package*.json ./

# Instale as dependências
RUN npm install --legacy-peer-deps

# Copie o restante do código para o container
COPY . .

# Faça o build do projeto React
RUN npm run build

# Use uma imagem leve do Nginx para servir o build
FROM nginx:alpine

# Copie os arquivos buildados para o diretório padrão do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponha a porta 80 para acessar o frontend
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]


# Servir os arquivos com Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]