# AI Shar'i Worker (free)

Hides the Gemini key and limits usage. The app searches Quran/hadith **offline in the browser**; the Worker only
(1) classifies the question + produces Arabic search keywords and (2) writes a short Kurdish answer **from the supplied passages only**.

## Setup (once, ~10 minutes, no payment)
1. Gemini key: https://aistudio.google.com/apikey -> Create API key (free tier). Note: on the free tier Google may use prompts to improve its products.
2. Cloudflare: free account at https://dash.cloudflare.com -> copy your **Account ID** (Workers & Pages page, right side).
   Create an API token: My Profile -> API Tokens -> Create Token -> template "Edit Cloudflare Workers".
3. GitHub repo -> Settings -> Secrets and variables -> Actions -> **Secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GEMINI_API_KEY`.
4. Actions -> "Deploy AI Shar'i worker" -> Run workflow. The log prints the URL `https://qurani-ai-shari.<name>.workers.dev`.
5. Settings -> Secrets and variables -> Actions -> **Variables** -> `AI_WORKER_URL` = that URL. Re-run the "pages" workflow.

Limits (edit `wrangler.toml`): `DAILY_LIMIT` questions per IP per day (default 25), `MODELS` fallback order.
Free Cloudflare KV allows ~1000 writes/day, i.e. about 1000 questions/day in total.
