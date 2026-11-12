# Da Berto 4.0

Anteprima statica del nuovo sito **Pizzeria Da Berto** (Gradara), pubblicata con GitHub Pages:
https://rinaldi-fabio.github.io/Da-Berto-4.0/

Copia di sola lettura per far vedere il sito al cliente: niente pannello WordPress, pagine con `noindex`
(Google non le indicizza). Il progetto vero (tema, database, strumenti) resta privato, nella cartella
`Da Berto Pizzeria 3.0 - Stile Pepe` (branch `stile-pepe`).

## Aggiornare l'anteprima
Con il sito `da-berto-pepe.local` avviato in Local:

```bash
node esporta.mjs
git add -A && git commit -m "Aggiorna anteprima" && git push
```

`esporta.mjs` legge le pagine via HTTP (WordPress non viene modificato), rende relativi gli indirizzi e
ricrea tutto da zero. GitHub Pages pubblica in 1–2 minuti.
