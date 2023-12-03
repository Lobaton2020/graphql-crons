### Comandos de instalacion de librerias
`npm init -y`
`npm i express cors apollo-server-express graphql graphql-import-node graphql-tools ncp`
`npm i -D @types/cors @types/express @types/express-graphql @types/node nodemon ts-node typescript`
`"dev": "nodemon src/index.ts --exec ts-node src/index.ts -e ts,graphql"`

DESPLIEGUE:
`yarn build`
`npx vercel --prod`

Si necesito añadir mas env ver video de luis lira youtube