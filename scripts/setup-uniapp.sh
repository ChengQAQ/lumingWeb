#!/bin/bash

# RuoYiFrontEnd UniApp平板端初始化脚本

echo "🚀 开始初始化UniApp平板端项目..."

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 需要Node.js 16或更高版本"
    exit 1
fi

# 创建项目目录结构
echo "📁 创建项目目录结构..."
mkdir -p uniapp
mkdir -p shared/api
mkdir -p shared/utils
mkdir -p shared/constants
mkdir -p shared/types
mkdir -p docs

# 移动现有Web端到web目录
echo "📦 移动现有Web端..."
if [ ! -d "web" ]; then
    mkdir web
    mv src web/
    mv public web/
    mv package.json web/
    mv vue.config.js web/
    mv babel.config.js web/
    mv .gitignore web/
    mv README.md web/
    mv dist web/ 2>/dev/null || true
    mv build web/ 2>/dev/null || true
    mv bin web/ 2>/dev/null || true
fi

echo "✅ 基础目录结构创建完成！" 