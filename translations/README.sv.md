<p align="center">
  <a href="https://github.com/mem0ai/mem0">
    <img src="docs/images/banner-sm.png" width="800px" alt="Mem0 - Minneslagret för personlig AI">
  </a>
</p>
<p align="center" style="display: flex; justify-content: center; gap: 20px; align-items: center;">
  <a href="https://trendshift.io/repositories/11194" target="blank">
    <img src="https://trendshift.io/api/badge/repositories/11194" alt="mem0ai%2Fmem0 | Trendshift" width="250" height="55"/>
  </a>
</p>

<p align="center">
  <a href="https://mem0.ai">Läs mer</a>
  ·
  <a href="https://mem0.dev/DiG">Gå med i Discord</a>
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
    <img src="https://img.shields.io/pypi/dm/mem0ai" alt="Mem0 PyPI - Nedladdningar">
  </a>
  <a href="https://github.com/mem0ai/mem0">
    <img src="https://img.shields.io/github/commit-activity/m/mem0ai/mem0?style=flat-square" alt="GitHub commit-aktivitet">
  </a>
  <a href="https://pypi.org/project/mem0ai" target="blank">
    <img src="https://img.shields.io/pypi/v/mem0ai?color=%2334D058&label=pypi%20package" alt="Paketversion">
  </a>
  <a href="https://www.npmjs.com/package/mem0ai" target="blank">
    <img src="https://img.shields.io/npm/v/mem0ai" alt="Npm-paket">
  </a>
  <a href="https://www.ycombinator.com/companies/mem0">
    <img src="https://img.shields.io/badge/Y%20Combinator-S24-orange?style=flat-square" alt="Y Combinator S24">
  </a>
</p>

<p align="center">
  <a href="https://mem0.ai/research"><strong>📄 Bygga produktionsklara AI-agenter med skalbart långtidsminne →</strong></a>
</p>
<p align="center">
  <strong>⚡ +26 % noggrannhet jämfört med OpenAI Memory • 🚀 91 % snabbare • 💰 90 % färre tokens</strong>
</p>

> **🎉 mem0ai v1.0.0 är nu tillgänglig!** Denna stora uppdatering inkluderar API-modernisering, förbättrat stöd för vektorlagring och förbättrad GCP-integration. [Se migrationsguiden →](MIGRATION_GUIDE_v1.0.md)

## 🔥 Forskningshöjdpunkter
- **+26 % noggrannhet** jämfört med OpenAI Memory på LOCOMO-benchmarken
- **91 % snabbare svar** än full kontext, vilket säkerställer låg latens i stor skala
- **90 % lägre tokenanvändning** än full kontext, vilket minskar kostnaderna utan kompromisser
- [Läs hela artikeln](https://mem0.ai/research)

# Introduktion

[Mem0](https://mem0.ai) ("mem-zero") förbättrar AI-assistenter och agenter med ett intelligent minneslager, vilket möjliggör personliga AI-interaktioner. Det kommer ihåg användarpreferenser, anpassar sig till individuella behov och lär sig kontinuerligt över tid—perfekt för kundsupportchatbots, AI-assistenter och autonoma system.

### Viktiga funktioner och användningsområden

**Kärnkapaciteter:**
- **Flernivåminne**: Behåller sömlöst användar-, sessions- och agentstatus med adaptiv personalisering
- **Utvecklarvänlig**: Intuitivt API, plattformsoberoende SDK:er och ett helt hanterat tjänstealternativ

**Användningsområden:**
- **AI-assistenter**: Konsekventa, kontextuella konversationer
- **Kundsupport**: Kom ihåg tidigare ärenden och användarhistorik för skräddarsydd hjälp
- **Hälsovård**: Spåra patientpreferenser och historik för personlig vård
- **Produktivitet och spel**: Anpassade arbetsflöden och miljöer baserade på användarbeteende

## 🚀 Snabbstartsguide <a name="quickstart"></a>

Välj mellan vår värdplattform eller självhostade paket:

### Värdplattform

Kom igång på några minuter med automatiska uppdateringar, analyser och företagsäkerhet.

1. Registrera dig på [Mem0 Platform](https://app.mem0.ai)
2. Integrera minneslagret via SDK eller API-nycklar

### Självhostad (öppen källkod)

Installera SDK via pip:

```bash
pip install mem0ai
```

Installera SDK via npm:
```bash
npm install mem0ai
```

### Grundläggande användning

Mem0 kräver en LLM för att fungera, med `gpt-4.1-nano-2025-04-14 från OpenAI som standard. Det stöder dock en mängd olika LLM:er; för detaljer, se vår [dokumentation om stödda LLM:er](https://docs.mem0.ai/components/llms/overview).

Första steget är att initiera minnet:

```python
from openai import OpenAI
from mem0 import Memory

openai_client = OpenAI()
memory = Memory()

def chat_with_memories(message: str, user_id: str = "default_user") -> str:
    # Hämta relevanta minnen
    relevant_memories = memory.search(query=message, user_id=user_id, limit=3)
    memories_str = "\n".join(f"- {entry['memory']}" for entry in relevant_memories["results"])

    # Generera assistentsvar
    system_prompt = f"Du är en hjälpsam AI. Svara på frågan baserat på frågan och minnen.\nAnvändarminnen:\n{memories_str}"
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": message}]
    response = openai_client.chat.completions.create(model="gpt-4.1-nano-2025-04-14", messages=messages)
    assistant_response = response.choices[0].message.content

    # Skapa nya minnen från konversationen
    messages.append({"role": "assistant", "content": assistant_response})
    memory.add(messages, user_id=user_id)

    return assistant_response

def main():
    print("Chatta med AI (skriv 'exit' för att avsluta)")
    while True:
        user_input = input("Du: ").strip()
        if user_input.lower() == 'exit':
            print("Hejdå!")
            break
        print(f"AI: {chat_with_memories(user_input)}")

if __name__ == "__main__":
    main()
```

För detaljerade integrationssteg, se [Snabbstart](https://docs.mem0.ai/quickstart) och [API-referens](https://docs.mem0.ai/api-reference).

## 🔗 Integrationer och demos

- **ChatGPT med minne**: Personlig chatt driven av Mem0 ([Live Demo](https://mem0.dev/demo))
- **Webbläsartillägg**: Spara minnen över ChatGPT, Perplexity och Claude ([Chrome-tillägg](https://chromewebstore.google.com/detail/onihkkbipkfeijkadecaafbgagkhglop?utm_source=item-share-cb))
- **Langgraph-stöd**: Bygg en kundbot med Langgraph + Mem0 ([Guide](https://docs.mem0.ai/integrations/langgraph))
- **CrewAI-integration**: Anpassa CrewAI-utdata med Mem0 ([Exempel](https://docs.mem0.ai/integrations/crewai))

## 📚 Dokumentation och support

- Fullständig dokumentation: https://docs.mem0.ai
- Community: [Discord](https://mem0.dev/DiG) · [Twitter](https://x.com/mem0ai)
- Kontakt: founders@mem0.ai

## Citering

Vi har nu en artikel du kan citera:

```bibtex
@article{mem0,
  title={Mem0: Bygga produktionsklara AI-agenter med skalbart långtidsminne},
  author={Chhikara, Prateek och Khant, Dev och Aryan, Saket och Singh, Taranjeet och Yadav, Deshraj},
  journal={arXiv preprint arXiv:2504.19413},
  year={2025}
}
```

## ⚖️ Licens

Apache 2.0 — se [LICENSE](https://github.com/mem0ai/mem0/blob/main/LICENSE) för detaljer.