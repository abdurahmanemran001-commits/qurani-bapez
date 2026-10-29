/* Address of the AI Shar'i Cloudflare Worker (see worker/ai-shari/README.md).
 * Empty = grounded Gemini mode is off and the app uses the offline knowledge base. The deploy workflow can overwrite
 * this file from the repository variable AI_WORKER_URL. */
window.AI_SHARI_ENDPOINT = window.AI_SHARI_ENDPOINT || '';
