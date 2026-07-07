#!/bin/bash
# mirror.sh — Clone all branches from SOURCE into DEST
# Usage: bash mirror.sh <SOURCE_REPO_URL> <DEST_REPO_URL> <YOUR_PAT>
# Example:
#   bash mirror.sh \
#     https://github.com/Addinxt/addinxt.git \
#     https://github.com/swarooptatapudi/addinext.git \
#     ghp_xxxxxxxxxxxxxxxxxxxx

set -e

SOURCE_URL="$1"
DEST_URL="$2"
PAT="$3"

if [ -z "$SOURCE_URL" ] || [ -z "$DEST_URL" ] || [ -z "$PAT" ]; then
  echo "Usage: bash mirror.sh <SOURCE_URL> <DEST_URL> <YOUR_PAT>"
  exit 1
fi

# Inject PAT into destination URL
# Extracts  https://github.com/user/repo.git  →  https://PAT@github.com/user/repo.git
DEST_WITH_AUTH=$(echo "$DEST_URL" | sed "s|https://|https://${PAT}@|")
SOURCE_WITH_AUTH=$(echo "$SOURCE_URL" | sed "s|https://|https://${PAT}@|")

WORK_DIR="__mirror_tmp__"

echo ""
echo "🔁 Mirroring: $SOURCE_URL"
echo "        → to: $DEST_URL"
echo ""

# ── 1. Clone source (all remote branches, no checkout) ──────────────────────
echo "📥 Cloning source repo..."
git clone --no-local "$SOURCE_WITH_AUTH" "$WORK_DIR"
cd "$WORK_DIR"

# ── 2. Fetch every remote branch and create a local tracking branch ──────────
echo ""
echo "🌿 Fetching all remote branches..."
git fetch --all

for REMOTE_BRANCH in $(git branch -r | grep -v '\->' | sed 's/origin\///'); do
  if ! git show-ref --verify --quiet "refs/heads/$REMOTE_BRANCH"; then
    echo "  ✔  $REMOTE_BRANCH"
    git branch "$REMOTE_BRANCH" "origin/$REMOTE_BRANCH"
  fi
done

# ── 3. Point origin to destination and push all branches + tags ──────────────
echo ""
echo "📤 Pushing all branches and tags to destination..."
git remote set-url origin "$DEST_WITH_AUTH"

git push origin --all       # all branches
git push origin --tags      # all tags

echo ""
echo "✅ Mirror complete! All branches and tags pushed to:"
echo "   $DEST_URL"
echo ""

# ── 4. Cleanup ───────────────────────────────────────────────────────────────
cd ..
rm -rf "$WORK_DIR"
echo "🧹 Cleaned up temp directory."
