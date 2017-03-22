## Projeto de testes do processo de autenticação/autorização no Twitter.

## Instalação:
```sh
npm install
```
## Inicialização:
```sh
npm start
```

## Urls:

1. Geração do token de acesso:
http://localhost:8888/token

## Referências:
* [Fluxo de login Twitter](https://dev.twitter.com/web/sign-in/implementing)
* [Criação de oauth signatures](https://dev.twitter.com/oauth/overview/creating-signatures)
* [Autorização Oauth](https://dev.twitter.com/oauth/overview/authorizing-requests)
* [Validador de assinaturas](http://quonos.nl/oauthTester/)

Processo de geração do parâmetro **oauth_signature**:

1. Ordenar todos os parâmetros por nome e valor. Incluindo params request, headers params e body params.
2. Encodar os parâmetros e concatenar com & (como formulario html)
3. Encodar o método e a url do serviço com os parâmetros do passo 2
4. Concatenar o consumer secret e o token secret (Se possuir)

