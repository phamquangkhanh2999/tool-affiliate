#!/bin/bash
echo "================================="
echo "🔄 1. Đang load Docker Image..."
echo "================================="
docker load -i tool-affiliate.tar

echo "================================="
echo "🚀 2. Khởi động Database và Hệ thống..."
echo "================================="
docker-compose up -d

echo "================================="
echo "✅ Hệ thống đã chạy thành công tại http://localhost:3000"
echo "================================="
