import sys

with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """- **[Production Operations & Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md):** Environment variable setup, first-time Netlify/Strapi provisioning, and disaster recovery procedures.
- **[Strapi API Reference](docs/API_REFERENCE.md):** Comprehensive Strapi REST endpoints, query filters, and JWT authentication payloads documentation.
- **[Agentic QA Guidelines](docs/AGENTIC_QA_GUIDELINES.md):** Autonomous test triage directives and 100% coverage invariants."""

content = content.replace("- **[Production Operations & Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md):** Environment variable setup, first-time Netlify/Strapi provisioning, and disaster recovery procedures.\n- **[Agentic QA Guidelines](docs/AGENTIC_QA_GUIDELINES.md):** Autonomous test triage directives and 100% coverage invariants.", replacement)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)
