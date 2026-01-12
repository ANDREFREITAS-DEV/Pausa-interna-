# Pausa-interna-
# Pausa Interna (PWA Offline-first)

Um app simples (sem frameworks) para organizar pensamentos e emoções com gentileza.
**Não é terapia.** Funciona offline-first e salva dados no **LocalStorage**.

## Rodar localmente (recomendado)
Service Worker só funciona em **https** ou **localhost** (não em `file://`).

1) Abra a pasta do projeto no VS Code  
2) Use a extensão **Live Server**  
3) Clique em "Go Live"  
4) Abra no navegador: `http://127.0.0.1:5500` (ou similar)

> Observação: abrir `index.html` direto (file://) funciona, mas sem Service Worker.

## Publicar no Netlify (deploy estático)
1) Crie uma conta no Netlify
2) New site from Git / ou Drag & Drop da pasta do projeto
3) Sem build step (é estático)
4) Deploy

Depois do deploy (HTTPS), o PWA fica instalável no Android (standalone).

## Onde trocar o link da terapeuta
No `index.html`, procure:
```html
<a id="therapistLink" href="https://example.com">
