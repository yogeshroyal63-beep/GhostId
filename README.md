# GhostID v3

**Continuous behavioral session verification — no camera, no OTP, zero friction for real users.**

> Drop one script into any web app. GhostID silently verifies whether the person currently typing is the same person who logged in. Only impostors get interrupted.

**Hackathon Edition · GitHub DevDays · June 2026 · Built by Yogesh Rayal**

---

## What It Does

After login, GhostID runs in the background. Every 60 seconds (configurable), it extracts a keystroke feature vector and compares it against the user's enrolled behavioral baseline.

| Score | Tier | Action |
|-------|------|--------|
| 85–100 | `SILENT_PASS` | Session continues silently |
| 70–84 | `SOFT_NUDGE` | One-tap confirm |
| 40–69 | `TYPING_CHALLENGE` | Re-verify by typing a phrase |
| 0–39 | `HARD_STOP` | Session terminated, full re-auth |

## Use Cases

- **Exam fraud prevention** — detect mid-exam handoff
- **Ghost employees** — catch colleague clock-in fraud
- **Fintech session security** — stop cookie hijacking before transactions
- **Healthcare / EHR** — shared workstation walk-away detection

## Architecture

```
Browser (ghostid.js) → 41 features → FastAPI → ONNX encoder → cosine score → tier
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
python main.py
# API: http://localhost:8000/docs
```

> **Note:** Place `ghostid_encoder.onnx` and `scaler_params.json` in `backend/ml/` after running the Kaggle notebook. Without them, the API runs in **placeholder mode** with deterministic mock scoring for demo development.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# App: http://localhost:5173
```

### SDK Integration

```html
<script src="https://cdn.example.com/ghostid.js"></script>
<script>
  const ghost = new GhostID({
    userId: "user-123",
    apiUrl: "http://localhost:8000",
    onTierChange: (result) => console.log(result.tier, result.confidence_score),
  });
  ghost.start();
</script>
```

## ML Pipeline

Train the encoder on the CMU DSL Keystroke Dataset:

1. Open `ml/notebooks/ghostid_v3_training.ipynb` on Kaggle
2. Attach dataset: `yogeshrayal/dataset` (DSL-StrongPasswordData.csv)
3. Run all cells (~5 min with GPU)
4. Copy `ghostid_encoder.onnx` + `scaler_params.json` → `backend/ml/`

### ML Summary

```
Dataset:     CMU DSL Keystroke Dynamics (51 users, 20,400 sessions)
Features:    41 (31 raw timing + 10 speed-invariant ratios)
Model:       LSTM Encoder → 128-dim L2-normalized embedding
Loss:        ArcFace (angular margin = 0.5)
Model size:  ~60KB ONNX encoder
Inference:   <1ms CPU
New users:   Zero retraining required
```

## Project Structure

```
ghostid/
├── backend/          FastAPI API + ONNX inference
├── frontend/         React demo + judge-facing UI
├── sdk/              Drop-in ghostid.js
├── ml/               Notebook, models, analysis plots
└── .github/          CI/CD workflows
```

## Deployment

| Service | Platform | Root |
|---------|----------|------|
| Backend | Railway | `backend/` |
| Frontend | Vercel | `frontend/` |

Set `VITE_API_URL` on Vercel to your Railway backend URL.

## License

MIT

---

*GhostID v3 — Your users have a typing fingerprint. GhostID watches it.*
