#!/bin/bash

echo "================================================="
echo "🚀 BẮT ĐẦU ĐÓNG GÓI HỆ THỐNG AFFILIATE TOOL 🚀"
echo "================================================="

# 1. Tạo thư mục chứa package
echo "📁 1. Tạo thư mục deploy-pkg..."
mkdir -p deploy-pkg

# 2. Build Docker image
echo "📦 2. Đang build Docker Image (có thể mất vài phút)..."
docker build -t tool-affiliate:latest .

# 3. Xuất file tar
echo "💾 3. Đang xuất file image (tool-affiliate.tar) vào thư mục deploy-pkg..."
docker save -o deploy-pkg/tool-affiliate.tar tool-affiliate:latest

# 4. Copy các file cần thiết để chạy
echo "📄 4. Đang copy file cấu hình (.env) và docker-compose..."
cp docker-compose.prod.yml deploy-pkg/docker-compose.yml
if [ -f .env ]; then
  cp .env deploy-pkg/.env
else
  echo "⚠️ Không tìm thấy file .env, copy từ .env.example"
  cp .env.example deploy-pkg/.env
fi

# Tự động thay đổi DATABASE_URL thành localhost -> postgres để kết nối được trong Docker
if grep -q "localhost:8020" deploy-pkg/.env; then
  sed -i 's/localhost:8020/postgres:5432/g' deploy-pkg/.env
  echo "🔧 Đã tự động cấu hình DATABASE_URL trỏ vào container postgres."
fi

# 5. Tạo script chạy tự động cho máy đích (Linux/Mac)
echo "⚙️  5. Đang tạo file script tự chạy (run.sh & run.bat)..."
cat << 'EOF' > deploy-pkg/run.sh
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
EOF
chmod +x deploy-pkg/run.sh

# 6. Tạo script chạy cho Windows (.bat)
cat << 'EOF' > deploy-pkg/run.bat
@echo off
echo =================================
echo 1. Dang load Docker Image...
echo =================================
docker load -i tool-affiliate.tar

echo =================================
echo 2. Khoi dong Database va He thong...
echo =================================
docker-compose up -d

echo =================================
echo He thong da chay thanh cong tai http://localhost:3000
echo =================================
pause
EOF

echo ""
echo "🎉 ĐÓNG GÓI THÀNH CÔNG! 🎉"
echo "👉 Bước tiếp theo: Bạn hãy nén thư mục 'deploy-pkg' thành file .zip hoặc .rar"
echo "👉 Gửi file nén đó sang máy tính khác."
echo "👉 Ở máy mới, giải nén ra và click đúp vào 'run.bat' (nếu dùng Windows) hoặc chạy './run.sh' (nếu dùng Mac/Linux) là xong!"
