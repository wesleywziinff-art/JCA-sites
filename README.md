# JCA — Site institucional

Estrutura de landing page de alta performance construída a partir da referência
de layout automotivo, com a identidade visual da marca JCA.

## Identidade aplicada

A logo JCA é monocromática, itálica e de corte agressivo. O site traduz isso:

| Elemento | Decisão |
| --- | --- |
| Paleta | Preto absoluto, branco e grafite metálico — sem o vermelho da referência |
| Acento | Cromo/prata (`--jca-accent`) no lugar do vermelho |
| Tipografia | Archivo (display, itálico pesado) + Inter (texto) |
| Assinatura | Inclinação de `-12deg` (`--skew`) em barras, sublinhados e destaques |
| Texturas | Hachura diagonal fina sobre carbono, galeria em grayscale |

Os tokens ficam em `assets/css/tokens.css` — mudar a paleta inteira é editar
esse arquivo.

## Estrutura

```
index.html
assets/
  css/tokens.css   tokens de cor, tipografia, ritmo e movimento
  css/main.css     reset, layout, componentes, responsivo
  js/main.js       header sticky, menu mobile, reveal, scroll-spy, form
  img/logo-jca.svg
```

Seções: header fixo → hero → métricas de performance → modelo em destaque →
tecnologia → galeria → depoimentos → contato → footer.

## Rodar

Qualquer servidor estático:

```bash
python3 -m http.server 4173
```

## Substituindo os placeholders

Os blocos `.media` são placeholders com gradiente e rótulo. Para usar imagens
reais, coloque um `<img>` dentro do bloco e remova o atributo `data-label`:

```html
<div class="media showcase__media">
  <img src="assets/img/modelo-perfil.jpg" alt="JCA One em perfil lateral">
</div>
```

O formulário em `assets/js/main.js` valida no cliente e exibe uma confirmação
local — troque pelo envio ao endpoint real.
