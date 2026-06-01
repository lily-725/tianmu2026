#!/bin/bash

set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
PUBLIC_DIR="$PROJECT_ROOT/public"

THUMBNAIL_WIDTH=640
THUMBNAIL_HEIGHT=400

echo "=== 生成代码中引用的缩略图 ==="
echo "项目根目录: $PROJECT_ROOT"
echo "缩略图尺寸: ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}"
echo ""

grep -r "thumbnailUrl" "$PROJECT_ROOT/src" --include="*.ts" --include="*.tsx" | grep -v "types.ts" | grep -v "FeatureDetail.tsx" | grep -v "SidebarDefault.tsx" | awk -F'"' '{print $4}' | sort | uniq > /tmp/required_thumbs.txt

echo "需要生成的缩略图数量: $(wc -l < /tmp/required_thumbs.txt)"
echo ""

while read -r thumb_path; do
    [ -z "$thumb_path" ] && continue
    
    if [ -f "$PUBLIC_DIR/$thumb_path" ]; then
        echo "✓ $thumb_path (已存在)"
        continue
    fi
    
    dir=$(dirname "$thumb_path")
    filename=$(basename "$thumb_path")
    original_filename=$(echo "$filename" | sed 's|^thumb_||')
    original_path="$dir/$original_filename"
    
    if [ ! -f "$PUBLIC_DIR/$original_path" ]; then
        echo "✗ $thumb_path (原图不存在: $original_path)"
        continue
    fi
    
    echo "⚙️ 生成: $thumb_path"
    sips -z "$THUMBNAIL_HEIGHT" "$THUMBNAIL_WIDTH" "$PUBLIC_DIR/$original_path" --out "$PUBLIC_DIR/$thumb_path" >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✓ 生成成功"
    else
        echo "✗ 生成失败"
    fi
done < /tmp/required_thumbs.txt

echo ""
echo "=== 缩略图生成完成 ==="