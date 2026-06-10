# Deployment Guide

## Docker (Recommended)

### Quick Start

1. Copy the environment template and configure:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and fill in your values
   ```

2. Build and run all services:
   ```bash
   docker compose up --build
   ```

3. Access the services:
   - **Backend API:** http://localhost:8000
   - **Frontend:** http://localhost:5173
   - **API Documentation:** http://localhost:8000/docs

The backend and frontend run on a shared internal network (`ghostid-net`) and expose the specified ports to your host machine.

---

## Backend → Railway

1. Push this repo to GitHub (`gostid`)
2. [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Root directory: `backend/`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment variables from `backend/.env.example`
6. After Kaggle training, ensure `backend/ml/ghostid_encoder.onnx` is committed or uploaded

## Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Root directory: `frontend/`
3. Build: `npm run build` · Output: `dist/`
4. Env: `VITE_API_URL=https://your-backend.up.railway.app`

## Local Development

```bash
# Terminal 1 — API
cd backend && pip install -r requirements.txt && python main.py

# Terminal 2 — UI
cd frontend && npm install && npm run dev
```

## Post-Training Checklist

- [ ] Run `ml/notebooks/ghostid_v3_training.ipynb` on Kaggle
- [ ] Copy `ghostid_encoder.onnx` + `scaler_params.json` → `backend/ml/`
- [ ] Copy analysis PNGs → `ml/analysis/`
- [ ] Re-run CI — ONNX validation job should pass
