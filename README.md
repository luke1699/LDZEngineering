# Portfolio · Luca De Zuane

Sito statico Hugo con tema **ldz-canvas** (in `themes/ldz-canvas`), derivato da
[CareerCanvas](https://github.com/felipecordero/careercanvas) (MIT) e riscritto in CSS/JS puro:
nessun Node, Tailwind o PostCSS da installare, basta Hugo.

## Dove si modificano i contenuti

| Cosa | File |
|---|---|
| Pagine (titolo, sottotitolo, ordine nel menu) | `content/chi-sono.md`, `competenze.md`, `esperienze.md`, `formazione.md`, `contatti.md` |
| Testi della home ("Cosa faccio") | `data/home.yaml` |
| Casa interattiva (persona che accende le luci) | `themes/ldz-canvas/layouts/partials/building-svg.html`, `phone-app.html`, logica in `assets/js/main.js` |
| Nome, ruolo, frasi dell'hero, e-mail, telefono, LinkedIn, CV | `hugo.toml` → `[params]` |
| Chi sono, quick facts, numeri | `data/about.yaml` |
| Competenze, software, lingue | `data/skills.yaml` |
| Esperienze lavorative | `data/experience.yaml` |
| Formazione | `data/education.yaml` |
| Foto, logo, favicon | `static/images/`, `static/favicon.*` |

Nota privacy: indirizzo di casa, data di nascita e cellulare **non** sono pubblicati.
Per offrire il CV in download, metti in `static/files/` una versione senza indirizzo
e imposta `resume_url = "files/nome-file.pdf"`.

## Anteprima in locale

```bash
hugo server
# apri http://localhost:1313
```
Serve Hugo **extended ≥ 0.158** (https://gohugo.io/installation/).

## Pubblicazione su GitHub Pages

1. Crea un repository su GitHub (es. `portfolio`, oppure `<utente>.github.io` per averlo alla radice).
2. Carica il contenuto di questa cartella:
   ```bash
   git init && git add . && git commit -m "Primo commit"
   git branch -M main
   git remote add origin https://github.com/<utente>/<repo>.git
   git push -u origin main
   ```
3. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Il workflow `.github/workflows/hugo.yml` parte a ogni push su `main`
   (o a mano da **Actions → Deploy Hugo su GitHub Pages → Run workflow**).
   Il `baseURL` viene impostato in automatico.

Dominio personalizzato (es. `www.ldzengineering.it`): aggiungilo in **Settings → Pages → Custom domain**
e crea un record DNS `CNAME` verso `<utente>.github.io`.

## Crediti
Tema originale: CareerCanvas © Felipe Cordero (MIT). Icone: Font Awesome Free. Font: IBM Plex (OFL).
