# GG52 Floripa DX Website

![Logo GG52 Floripa DX](./GG52-Logo-768x514.png)

Landing page oficial do GG52 Floripa DX, com foco em presença institucional, links de logbook, widgets do QRZ e formulário de newsletter.

## Visão geral

Este projeto foi desenvolvido como página de apresentação do time, com visual responsivo e deploy automatizado.

Principais pontos:

- Layout moderno e responsivo
- Efeito parallax na logo (desktop e mobile)
- Integração com logbooks (QRZ e Hampass)
- Widgets de estatísticas do QRZ
- Newsletter com backend em PHP salvando inscritos em arquivo TXT
- Deploy automático via GitHub Actions para Hostgator (FTP)

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- PHP (newsletter)
- Apache .htaccess
- GitHub Actions

## Estrutura do projeto

- index.html: estrutura principal da página
- styles.css: estilos e responsividade
- script.js: parallax, sensores mobile e lazy load dos iframes
- newsletter.php: endpoint de inscrição da newsletter
- newsletter-handler.js: envio assíncrono do formulário
- .htaccess: headers, cache e compressão
- .github/workflows/deploy-hostgator-ftp.yml: pipeline de deploy por FTP

## Como rodar localmente

1. Abra a pasta no VS Code.
2. Suba um servidor local (exemplo: extensão Live Server).
3. Acesse a página no navegador.

Observação:

- Para testar o fluxo completo da newsletter, rode em ambiente com PHP.

## Newsletter

O formulário envia email para newsletter.php, que:

- valida email
- impede duplicados
- aplica rate limit simples por IP
- grava em subscribers.txt

Arquivos de apoio:

- subscribers.txt (gerado automaticamente no primeiro cadastro)
- .rate_limit (controle simples de requisições)
- .newsletter_log (log de inscrições)

## Deploy automático (GitHub Actions + Hostgator FTP)

Workflow:

- Arquivo: .github/workflows/deploy-hostgator-ftp.yml
- Gatilhos: push em main e execução manual

Secrets necessários no GitHub:

- FTP_SERVER
- FTP_USERNAME
- FTP_PASSWORD
- FTP_SERVER_DIR

Exemplo comum de diretório remoto:

- /public_html/

## Boas práticas de deploy

- Atualize versão de cache-busting no index.html quando necessário
- Valide a página após deploy em desktop e mobile
- Faça backup periódico de subscribers.txt
- Não versionar arquivos sensíveis de runtime

## Roadmap sugerido

- Página institucional final (trocar estado Em Desenvolvimento)
- Painel simples para listar inscritos da newsletter
- Melhorias de observabilidade e métricas
- Hardening adicional de segurança no servidor

## Time

GG52 Floripa DX
Florianópolis, SC - Brasil
