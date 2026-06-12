

## 🔐 Security Features

- **API Key Authentication** — Bearer token in `X-GhostID-Key` header
- **Rate Limiting** — configurable per-user request limits (default 30/min) on `/enroll` and `/score`
- **Encrypted Embeddings** — Fernet encryption at rest (when `EMBEDDING_ENCRYPTION_KEY` is set)
- **CORS Protection** — configurable allowed origins
- **Input Validation** — 41-feature vector validation
- **Secure Defaults** — `.env.example` template provided for both backend and frontend

---

## 🚢 Deployment

### Backend (Railway / Any Python Host)

```bash
# Set environment variables
export GHOSTID_API_KEY="your-api-key"
export EMBEDDING_ENCRYPTION_KEY="your-fernet-key"
export DB_PATH="ghostid.db"

# Install dependencies
pip install -r backend/requirements.txt

# Run server
cd backend && python main.py
```

### Frontend (Vercel / Any Static Host)

```bash
# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend.railway.app
VITE_API_KEY=your-api-key

# Deploy
npm run build
# Upload dist/ folder to Vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production setup, including how to generate a Fernet key and configure session retention.

---

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

You're free to:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Include in larger works

Just include the license notice.

---

## 🎥 Demo

> **30-second demo:** capture of keystroke monitoring → live scoring → tier transitions in the UI.
>
> *(Demo video/GIF coming soon — see project board for status.)*

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on setting up your dev environment, coding standards, and how to submit pull requests. Please also read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating.

Quick start:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-improvement`)
3. Commit with clear messages (`git commit -m "Add new test case"`)
4. Push and open a PR

All PRs must pass CI (linting, tests, builds).

---

## 💡 FAQ

**Q: Does GhostID work on mobile?**
A: Yes, through the browser JS SDK. Keystroke dynamics adapts to on-screen keyboards.

**Q: What if the ONNX model isn't deployed?**
A: The backend runs in **placeholder mode** with deterministic, non-functional scoring — useful for frontend development only.

**Q: How long is the baseline stored?**
A: 7 days by default (configurable). After that, re-enroll to update the baseline.

**Q: Can GhostID detect copy-paste attacks?**
A: Yes — copy-pasted text produces different keystroke timings (zero inter-key delay).

---

## 📞 Support

- 📖 **Docs:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production guide
- 🐛 **Issues:** File bugs on GitHub
- 💬 **Discussions:** Ask questions in GitHub Discussions

---

*GhostID — Your users have a typing fingerprint. GhostID watches it.*