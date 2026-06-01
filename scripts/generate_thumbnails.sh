#!/bin/bash

set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
PUBLIC_DIR="$PROJECT_ROOT/public"

THUMBNAIL_WIDTH=640
THUMBNAIL_HEIGHT=400

echo "=== 开始生成缩略图 ==="
echo "项目根目录: $PROJECT_ROOT"
echo "缩略图尺寸: ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}"
echo ""

generate_thumbnails() {
    local dir=$1
    echo "处理目录: $dir"
    
    for img in "$dir"/*.jpg; do
        [ -f "$img" ] || continue
        
        local filename=$(basename "$img")
        local thumbname="thumb_$filename"
        local thumbpath="$dir/$thumbname"
        
        if [ -f "$thumbpath" ]; then
            echo "  ✓ $filename -> $thumbname (已存在，跳过)"
            continue
        fi
        
        echo "  ⚙️  $filename -> $thumbname"
        
        sips -z "$THUMBNAIL_HEIGHT" "$THUMBNAIL_WIDTH" "$img" --out "$thumbpath" >/dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "  ✓ 生成成功"
        else
            echo "  ✗ 生成失败"
        fi
    done
    
    echo ""
}

generate_thumbnails "$PUBLIC_DIR/shuru"
generate_thumbnails "$PUBLIC_DIR/ditu"
generate_thumbnails "$PUBLIC_DIR/import"

echo "=== 缩略图生成完成 ==="