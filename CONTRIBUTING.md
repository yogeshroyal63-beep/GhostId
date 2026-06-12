# Contributing to GhostID v3

Thanks for your interest in contributing! GhostID is an open-source behavioral biometric authentication system — every contribution helps make the web more secure.

---

## 🧭 Where to Start

- Browse issues labeled [`good first issue`](../../issues?q=label%3A%22good+first+issue%22) — these are intentionally scoped for new contributors
- Check [`help wanted`](../../issues?q=label%3A%22help+wanted%22) for slightly larger tasks
- Ask questions in [GitHub Discussions](../../discussions) before starting big changes

---

## 🛠️ Local Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -c "from app.db.database import init_db; init_db()"
python main.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Run Tests
```bash
cd backend
pytest tests/test_endpoints.py -v
```

All PRs must pass CI (lint + tests + build) before review.

---

## 📋 Contribution Types

| Type | Examples |
|------|---------|
| 🐛 Bug fix | Fix field mismatches, threshold logic errors |
| 📝 Docs | Improve README, add code comments, fix typos |
| ✅ Tests | Add missing test cases for endpoints or ML pipeline |
| 🌐 Feature | New browser support, mobile SDK improvements |
| 🎨 UI | Frontend component improvements |
| 🧠 ML | Dataset experiments, model improvements |

---

## 🔄 PR Process

1. Fork the repo
2. Create a branch: `git checkout -b fix/your-fix-name`
3. Make your changes
4. Run tests: `pytest tests/test_endpoints.py -v`
5. Commit with a clear message: `git commit -m "fix: describe what you fixed"`
6. Push and open a PR against `main`
7. Fill in the PR template

**PR title format:**
- `fix: short description`
- `feat: short description`
- `docs: short description`
- `test: short description`

---

## 🚫 What Not to Do

- Don't submit PRs without running tests first
- Don't change the 41-feature vector schema without discussion (breaking change)
- Don't add new dependencies without opening an issue first
- Don't submit AI-generated code without reviewing and testing it

---

## 💬 Getting Help

Open a [GitHub Discussion](../../discussions) or comment on the relevant issue. Response time is typically within 48 hours.

---

*GhostID v3 — Built by Yogesh Rayal · MIT License*