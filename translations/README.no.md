<p align="center">
  <a href="https://github.com/mem0ai/mem0">
    <img src="docs/images/banner-sm.png" width="800px" alt="Mem0 - Minnelaget for personalisert KI">
  </a>
</p>
<p align="center" style="display: flex; justify-content: center; gap: 20px; align-items: center;">
  <a href="https://trendshift.io/repositories/11194" target="blank">
    <img src="https://trendshift.io/api/badge/repositories/11194" alt="mem0ai%2Fmem0 | Trendshift" width="250" height="55"/>
  </a>
</p>

<p align="center">
  <a href="https://mem0.ai">Lær mer</a>
  ·
  <a href="https://mem0.dev/DiG">Bli med på Discord</a>
  ·
  <a href="https://mem0.dev/demo">Demo</a>
  ·
  <a href="https://mem0.dev/openmemory">OpenMemory</a>
</p>

<p align="center">
  <a href="https://mem0.dev/DiG">
    <img src="https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=white" alt="Mem0 Discord">
  </a>
  <a href="https://pepy.tech/project/mem0ai">
    <img src="https://img.shields.io/pypi/dm/mem0ai" alt="Mem0 PyPI - Downloads">
  </a>
  <a href="https://github.com/mem0ai/mem0">
    <img src="https://img.shields.io/github/commit-activity/m/mem0ai/mem0?style=flat-square" alt="GitHub commit activity">
  </a>
  <a href="https://pypi.org/project/mem0ai" target="blank">
    <img src="https://img.shields.io/pypi/v/mem0ai?color=%2334D058&label=pypi%20package" alt="Package version">
  </a>
  <a href="https://www.npmjs.com/package/mem0ai" target="blank">
    <img src="https://img.shields.io/npm/v/mem0ai" alt="Npm package">
  </a>
  <a href="https://www.ycombinator.com/companies/mem0">
    <img src="https://img.shields.io/badge/Y%20Combinator-S24-orange?style=flat-square" alt="Y Combinator S24">
  </a>
</p>

<p align="center">
  <a href="https://mem0.ai/research"><strong>📄 Bygging av produksjonsklare KI-agenter med skalerbart langtidsminne →</strong></a>
</p>
<p align="center">
  <strong>⚡ +26% nøyaktighet vs. OpenAI Memory • 🚀 91% raskere • 💰 90% færre tokens</strong>
</p>

> **🎉 mem0ai v1.0.0 er nå tilgjengelig!** Denne store utgivelsen inkluderer API-modernisering, forbedret støtte for vektorlagring og forbedret GCP-integrasjon. [Se migreringsguide →](MIGRATION_GUIDE_v1.0.md)

##  🔥 Forskningshøydepunkter
- **+26% nøyaktighet** over OpenAI Memory på LOCOMO-standarden
- **91% raskere respons** enn full-kontekst, som sikrer lav latens i stor skala
- **90% lavere tokenbruk** enn full-kontekst, reduserer kostnader uten kompromiss
- [Les hele artikkelen](https://mem0.ai/research)

# Introduksjon

[Mem0](https://mem0.ai) ("mem-zero") forbedrer KI-assistenter og agenter med et intelligent minnelag, som muliggjør personaliserte KI-interaksjoner. Den husker brukerpreferanser, tilpasser seg individuelle behov og lærer kontinuerlig over tid—ideell for chatbots for kundesupport, KI-assistenter og autonome systemer.

### Nøkkelfunksjoner og bruksområder

**Kjernefunksjoner:**
- **Flernivåminne**: Bevarer sømløst bruker-, sesjons- og agenttilstand med adaptiv personalisering
- **Utviklervennlig**: Intuitiv API, plattformuavhengige SDK-er og et fullt administrert tjenestealternativ

**Bruksområder:**
- **KI-assistenter**: Konsistente, kontekstrike samtaler
- **Kundesupport**: Husk tidligere henvendelser og brukerhistorikk for skreddersydd hjelp
- **Helsevesen**: Spor pasientpreferanser og historikk for personlig omsorg
- **Produktivitet og spill**: Adaptive arbeidsflyter og miljøer basert på brukeratferd

## 🚀 Hurtigstartsguide <a name="quickstart"></a>

Velg mellom vår hostede plattform eller selvhostet pakke:

### Hostet plattform

Kom i gang på minutter med automatiske oppdateringer, analyser og bedriftssikkerhet.

1. Registrer deg på [Mem0 Platform](https://app.mem0.ai)
2. Integrer minnelaget via SDK eller API-nøkler

### Selvhostet (åpen kildekode)

Installer SDK via pip:

```bash
pip install mem0ai
```

Installer SDK via npm:
```bash
npm install mem0ai
```

### Grunnleggende bruk

Mem0 krever en LLM for å fungere, med `gpt-4.1-nano-2025-04-14` fra OpenAI som standard. Den støtter imidlertid en rekke LLM-er; for detaljer, se vår [dokumentasjon for støttede LLM-er](https://docs.mem0.ai/components/llms/overview).

Første trinn er å instansiere minnet:

```python
from openai import OpenAI
from mem0 import Memory

openai_client = OpenAI()
memory = Memory()

def chat_with_memories(message: str, user_id: str = "default_user") -> str:
    # Hent relevante minner
    relevant_memories = memory.search(query=message, user_id=user_id, limit=3)
    memories_str = "\n".join(f"- {entry['memory']}" for entry in relevant_memories["results"])

    # Generer assistentsvar
    system_prompt = f"Du er en hjelpsom KI. Svar på spørsmålet basert på spørring og minner.\nBrukerminner:\n{memories_str}"
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": message}]
    response = openai_client.chat.completions.create(model="gpt-4.1-nano-2025-04-14", messages=messages)
    assistant_response = response.choices[0].message.content

    # Opprett nye minner fra samtalen
    messages.append({"role": "assistant", "content": assistant_response})
    memory.add(messages, user_id=user_id)

    return assistant_response

def main():
    print("Chat med KI (skriv 'exit' for å avslutte)")
    while True:
        user_input = input("Du: ").strip()
        if user_input.lower() == 'exit':
            print("Farvel!")
            break
        print(f"KI: {chat_with_memories(user_input)}")

if __name__ == "__main__":
    main()
```

For detaljerte integrasjonstrinn, se [Hurtigstart](https://docs.mem0.ai/quickstart) og [API-referanse](https://docs.mem0.ai/api-reference).

## 🔗 Integrasjoner og demoer

- **ChatGPT med minne**: Personalisert chat drevet av Mem0 ([Live demo](https://mem0.dev/demo))
- **Nettleserutvidelse**: Lagre minner på tvers av ChatGPT, Perplexity og Claude ([Chrome-utvidelse](https://chromewebstore.google.com/detail/onihkkbipkfeijkadecaafbgagkhglop?utm_source=item-share-cb))
- **Langgraph-støtte**: Bygg en kundebot med Langgraph + Mem0 ([Guide](https://docs.mem0.ai/integrations/langgraph))
- **CrewAI-integrasjon**: Tilpass CrewAI-resultater med Mem0 ([Eksempel](https://docs.mem0.ai/integrations/crewai))

## 📚 Dokumentasjon og støtte

- Full dokumentasjon: https://docs.mem0.ai
- Fellesskap: [Discord](https://mem0.dev/DiG) · [Twitter](https://x.com/mem0ai)
- Kontakt: founders@mem0.ai

## Sitering

Vi har nå en artikkel du kan sitere:

```bibtex
@article{mem0,
  title={Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory},
  author={Chhikara, Prateek and Khant, Dev and Aryan, Saket and Singh, Taranjeet and Yadav, Deshraj},
  journal={arXiv preprint arXiv:2504.19413},
  year={2025}
}
```

## ⚖️ Lisens

Apache 2.0 — se [LICENSE](https://github.com/mem0ai/mem0/blob/main/LICENSE)-filen for detaljer.