param(
  [string]$branch = 'main'
)

Write-Output "Initializing repository..."

git add .
git commit -m "chore: initial scaffold"

git branch -M $branch

Write-Output "Done."
