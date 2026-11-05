# ML Pipeline

Evaluate and train the GhostID encoder with `notebooks/ghostid_v4_evaluation.ipynb`, then copy the artifacts into `backend/ml/`.

## Outputs

| File | Destination |
|------|-------------|
| `ghostid_encoder.onnx` | `backend/ml/` |
| `scaler_params.json` | `backend/ml/` (always copy both together) |
| `open_set_analysis.png`, `open_set_summary.csv`, `poisoning_summary.csv` | `ml/analysis/` |

## Notebook

Run `notebooks/ghostid_v4_evaluation.ipynb` with dataset **DSL-StrongPasswordData.csv** (51 users, 20,400 sessions). About 20-40 min on one GPU. Set `QUICK = True` for a 1-seed smoke test.

## Measured results

- Closed-set (enrolled users): per-user EER 3.09%, AUC 0.989
- Open-set (unseen users): EER 32.3% at k=2, 15.6% at k=50
- ONNX size 3.3 MB, latency 0.18 ms (CPU)

Full tables and protocol: see the root `README.md`.

## Placeholder mode

Until `ghostid_encoder.onnx` is present, the backend uses deterministic mock embeddings so the demo UI and SDK remain testable.