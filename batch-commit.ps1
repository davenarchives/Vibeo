# Batch Commit Script for Vibeo
# This script commits all uncommitted changes one by one.

$files = @(
    @{ path = "index.html"; msg = "chore: update SEO meta tags and app title" },
    @{ path = "src/App.jsx"; msg = "feat: implement global ErrorBoundary and cinematic loading screen" },
    @{ path = "src/api/geminiClient.js"; msg = "refactor: modernize search history logic and ID generation" },
    @{ path = "src/api/tmdbClient.js"; msg = "perf: implement limited-size FIFO cache for TMDB requests" },
    @{ path = "src/api/vibeyAI.js"; msg = "perf: optimize Vibey AI session caching and history keys" },
    @{ path = "src/components/layout/CollectionGrid/index.jsx"; msg = "style: refine collection grid layout for premium feel" },
    @{ path = "src/components/layout/HeroBanner/index.jsx"; msg = "perf: integrate active trailer prefetching in HeroBanner" },
    @{ path = "src/context/UserMoviesContext.jsx"; msg = "refactor: implement robust Firestore data sanitization for user movies" },
    @{ path = "src/hooks/useMovieDetail.js"; msg = "feat: add US certification and content rating support" },
    @{ path = "src/hooks/useTrailers.js"; msg = "perf: optimize trailer fetching with lazy prefetching" },
    @{ path = "src/main.jsx"; msg = "refactor: update React Query config for v5 compatibility" },
    @{ path = "src/pages/Play/index.jsx"; msg = "refactor: use global tmdbClient and lazy load episode thumbs" },
    @{ path = "src/pages/Play/styles.css"; msg = "style: optimize video player responsiveness for mobile" },
    @{ path = "src/pages/Search/index.jsx"; msg = "perf: add 300ms debounce to search input" },
    @{ path = "src/pages/Watch/index.jsx"; msg = "perf: defer trailer iframe for better initial TTI" },
    @{ path = "src/pages/Watch/styles.css"; msg = "style: improve Watch page layout spacing on mobile" },
    @{ path = "src/styles/index.css"; msg = "style: add cinematic loading bar and float animations" },
    @{ path = "middleware.js"; msg = "feat: add Vercel edge middleware for AI API rate limiting" },
    @{ path = "src/components/common/ErrorBoundary/index.jsx"; msg = "feat: add production-ready ErrorBoundary component" },
    @{ path = "src/components/common/ErrorBoundary/styles.css"; msg = "style: add glassmorphism styles for ErrorBoundary" },
    @{ path = "batch-commit.ps1"; msg = "chore: add automated batch commit script" }
)

Write-Host "Starting batch commit process..." -ForegroundColor Cyan

foreach ($file in $files) {
    if (Test-Path $file.path) {
        Write-Host "Committing: $($file.path)..." -ForegroundColor Yellow
        git add $file.path
        git commit -m $file.msg
    } else {
        Write-Host "Warning: File not found: $($file.path)" -ForegroundColor Red
    }
}

Write-Host "`nAll files committed successfully! You can now push manually." -ForegroundColor Green
Write-Host "Command: git push origin main" -ForegroundColor Gray
