# Corrigir imagens para hospedagem externa

## Implementação
- Baixar os nove arquivos reais atualmente usados na página inicial: a marca e as oito capas.
- Salvar os arquivos em `public/assets` para que Vite e Vercel os sirvam diretamente.
- Trocar somente as referências de imagem por caminhos `/assets/...`, preservando textos, preços, checkout, tracking, Meta Pixel, UTMs e aparência.
- Atualizar também outras telas que reutilizam a mesma marca ou capas, evitando dependência residual desses arquivos internos.

## Validação
- Confirmar que a página inicial não contém nenhuma referência `/__l5e/`.
- Validar que todos os arquivos locais respondem e que a página mantém as mesmas dimensões e imagens.
- Rodar a verificação de tipos e o build de produção; corrigir os erros que bloqueiam a publicação.
- Publicar a versão aprovada. As alterações do projeto serão registradas no histórico sincronizado com o GitHub conectado.

## Detalhes técnicos
- Os binários serão copiados sem recompressão ou transformação, garantindo identidade visual exata.
- Nenhuma chave privada, configuração de pagamento ou conteúdo público será alterado.
