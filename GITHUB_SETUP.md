# Push to GitHub (`gostid`)

The local repo is ready on branch `main` with 8 commits. Create the remote repo once, then push:

## 1. Create repository on GitHub

1. Open [https://github.com/new](https://github.com/new)
2. **Repository name:** `gostid`
3. **Visibility:** Public (recommended for hackathon judges)
4. Do **not** add README, .gitignore, or license (already in this project)
5. Click **Create repository**

## 2. Push from your machine

```powershell
cd "d:\c folder user files\ghostid"
git remote set-url origin https://github.com/YOUR_USERNAME/gostid.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub handle (e.g. `yogeshrayal`).

## Commit history (for judges)

| Commit | Summary |
|--------|---------|
| `chore:` | Monorepo scaffold + README |
| `feat(ml):` | Kaggle notebook + ML layout |
| `feat(backend):` | FastAPI + placeholder ONNX mode |
| `feat(sdk):` | ghostid.js v3 |
| `feat(frontend):` | React demo UI |
| `ci:` | GitHub Actions (3 jobs) |
| `docs:` | Deployment guide |

## Optional: GitHub CLI

```powershell
winget install GitHub.cli
gh auth login
cd "d:\c folder user files\ghostid"
gh repo create gostid --public --source=. --remote=origin --push
```
