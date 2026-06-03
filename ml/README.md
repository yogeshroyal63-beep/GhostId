# ML Pipeline

Train the GhostID v3 encoder on Kaggle, then copy artifacts into `backend/ml/`.

## Outputs

| File | Destination |
|------|-------------|
| `ghostid_encoder.onnx` | `backend/ml/` |
| `scaler_params.json` | `backend/ml/` |
| `ghostid_analysis.png` | `ml/analysis/` |
| `poisoning_resistance.png` | `ml/analysis/` |
| `training_curves.png` | `ml/models/` |

## Notebook

Run `notebooks/ghostid_v3_training.ipynb` with dataset **DSL-StrongPasswordData.csv** (51 users, 20,400 sessions).

Expected metrics after training:
- AUC ~0.97–0.99
- EER ~2–4%
- ONNX size ~60KB

## Placeholder mode

Until `ghostid_encoder.onnx` is present, the backend uses deterministic mock embeddings so the demo UI and SDK remain testable.
