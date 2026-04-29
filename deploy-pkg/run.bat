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
