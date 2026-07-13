# GG52 Floripa DX Website

![Logo GG52 Floripa DX](./GG52-Logo-768x514.png)

Home oficial do GG52 Floripa DX: história do time, estações (Estação Patrocinada e Angelina), galeria de membros com links para o QRZ, logbooks, widgets do QRZ e formulário de newsletter.

## Dominio oficial

[https://gg52floripadx.com/](https://gg52floripadx.com/)

## Visão geral

Este projeto foi desenvolvido como página de apresentação do time, com visual responsivo e deploy automatizado.

Principais pontos:

- Layout moderno e responsivo
- Efeito parallax na logo (desktop e mobile)
- Seções institucionais: Quem Somos, Nossas Estações e O Time (galeria de membros)
- Galeria de membros com link para o perfil QRZ de cada indicativo
- Integração com logbooks (QRZ e Hampass)
- Widgets de estatísticas do QRZ
- Página em três idiomas (inglês padrão, português e espanhol) com seletor de bandeiras
- Analytics via Microsoft Clarity
- Newsletter com backend em PHP salvando inscritos em arquivo TXT
- Deploy automático via GitHub Actions para Hostgator (FTP)

## Idiomas

- O idioma padrão é o inglês; o visitante pode trocar para português ou espanhol pelas bandeiras no canto superior direito (a escolha fica salva no navegador via localStorage).
- Todos os textos traduzíveis ficam no objeto `GG52_TRANSLATIONS` em `i18n.js`. Para corrigir ou adicionar um texto, edite apenas esse arquivo e use o mesmo `data-i18n` no HTML.

## Galeria de membros

- A lista de membros fica no array `TEAM_MEMBERS` no topo de `script.js` (nome + indicativos). Para incluir, remover ou corrigir um membro, edite apenas esse array.
- Fotos: coloque um arquivo JPG na pasta `members/` com o nome do indicativo em minúsculas (ex: `members/pp5kj.jpg`). A foto substitui automaticamente o avatar de iniciais, sem mexer em código.
- Membro sem indicativo confirmado (`callsigns: []`) aparece sem link para o QRZ.
- Easter egg (flip): adicione `flip: true` ao membro no array e uma segunda foto `<indicativo>_2.jpg` na pasta `members/`. Ao passar o mouse (ou tocar, no celular) sobre o avatar, a foto vira com uma borda dourada. Hoje ativo para PP5NY, PP5GW e PU5HVW.

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
- script.js: galeria de membros (array TEAM_MEMBERS), parallax, sensores mobile e lazy load dos iframes
- i18n.js: traduções (inglês padrão, português e espanhol) e seletor de idioma
- members/: fotos dos membros (convenção: indicativo em minúsculas + .jpg)
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
- Durante o deploy, e gerado o arquivo deploy-info.json com versao e data/hora da publicacao para exibicao no rodape da pagina

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

- ~~Página institucional final (trocar estado Em Desenvolvimento)~~ (concluído)
- Fotos reais dos membros na pasta members/
- Versão HTML da biografia para o QRZ.com
- Painel simples para listar inscritos da newsletter
- Melhorias de observabilidade e métricas
- Hardening adicional de segurança no servidor

## Time

GG52 Floripa DX
Florianópolis, SC - Brasil
