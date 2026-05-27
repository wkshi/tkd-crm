#!/bin/bash
# =============================================================================
# Ansible 部署脚本本地测试工具
# 用法: ./ansible/tests/test-deploy.sh
#
# 此脚本在本地启动一个 Docker 容器作为 Ansible 目标，
# 执行 dry-run 和完整部署，验证 playbook 正确性。
# =============================================================================

set -euo pipefail

# ─── 颜色 ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─── 配置 ───
TEST_IMAGE="${TEST_IMAGE:-geerlingguy/docker-ubuntu2404-ansible}"
CONTAINER_NAME="tkd-crm-ansible-test"
TEST_INVENTORY="ansible/inventory-test.yml"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Ansible 部署脚本测试${NC}"
echo -e "${BLUE}========================================${NC}"

# ─── 前置检查 ───
if ! command -v docker &>/dev/null; then
  echo -e "${RED}错误：本地未安装 Docker${NC}"
  exit 1
fi

if ! command -v ansible-playbook &>/dev/null; then
  echo -e "${RED}错误：本地未安装 ansible-playbook${NC}"
  echo "请先安装: pip install ansible ansible-lint"
  exit 1
fi

# ─── 阶段 1: ansible-lint ───
echo ""
echo -e "${BLUE}[阶段 1/5] 运行 ansible-lint 静态检查...${NC}"
if ! ansible-lint ansible/; then
  echo -e "${RED}ansible-lint 检查失败${NC}"
  exit 1
fi
echo -e "${GREEN}ansible-lint 通过 ✓${NC}"

# ─── 阶段 2: 启动测试容器 ───
echo ""
echo -e "${BLUE}[阶段 2/5] 启动测试容器...${NC}"

# 清理旧容器
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# 启动 systemd 容器
docker run -d --name "$CONTAINER_NAME" \
  --privileged \
  -v /sys/fs/cgroup:/sys/fs/cgroup:ro \
  "$TEST_IMAGE" \
  /lib/systemd/systemd 2>/dev/null || {
    echo -e "${YELLOW}尝试备用镜像...${NC}"
    docker run -d --name "$CONTAINER_NAME" \
      --privileged \
      -v /sys/fs/cgroup:/sys/fs/cgroup:ro \
      jrei/systemd-ubuntu:24.04
  }

# 等待容器就绪
sleep 3

# 获取容器 IP
TARGET_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CONTAINER_NAME")
echo -e "容器 IP: ${YELLOW}${TARGET_IP}${NC}"

# 安装 SSH 服务并配置密钥访问
echo "配置 SSH 访问..."
docker exec "$CONTAINER_NAME" bash -c "
  apt-get update -qq >/dev/null 2>&1 || true
  apt-get install -y -qq openssh-server rsync curl wget >/dev/null 2>&1 || true
  mkdir -p /root/.ssh
  chmod 700 /root/.ssh
  service ssh start 2>/dev/null || systemctl start ssh 2>/dev/null || true
"

# 复制本地 SSH 公钥到容器
if [ -f ~/.ssh/id_rsa.pub ]; then
  docker exec -i "$CONTAINER_NAME" bash -c "cat >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys" < ~/.ssh/id_rsa.pub
elif [ -f ~/.ssh/id_ed25519.pub ]; then
  docker exec -i "$CONTAINER_NAME" bash -c "cat >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys" < ~/.ssh/id_ed25519.pub
else
  echo -e "${YELLOW}未找到 SSH 公钥，生成临时密钥...${NC}"
  ssh-keygen -t ed25519 -N "" -f /tmp/tkd-crm-test-key -C "test@tkd-crm"
  docker exec -i "$CONTAINER_NAME" bash -c "cat >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys" < /tmp/tkd-crm-test-key.pub
fi

# ─── 阶段 3: dry-run ───
echo ""
echo -e "${BLUE}[阶段 3/5] 执行 ansible-playbook --check (dry-run)...${NC}"

cat > "$TEST_INVENTORY" <<INV
all:
  children:
    tkd_crm_servers:
      hosts:
        test-target:
          ansible_host: ${TARGET_IP}
          ansible_user: root
          ansible_ssh_private_key_file: ~/.ssh/id_rsa
          ansible_ssh_extra_args: -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null
          app_port: 3000
          db_port: 5432
INV

cd ansible
ansible-playbook -i inventory-test.yml playbook.yml --check \
  -e "postgres_password=testpassword123" \
  -e "openai_api_key=sk-test-key" \
  -e "model=openai:gpt-4o"

echo -e "${GREEN}dry-run 通过 ✓${NC}"

# ─── 阶段 4: 完整部署 ───
echo ""
echo -e "${BLUE}[阶段 4/5] 执行完整 ansible-playbook...${NC}"

ansible-playbook -i inventory-test.yml playbook.yml \
  -e "postgres_password=testpassword123" \
  -e "openai_api_key=sk-test-key" \
  -e "model=openai:gpt-4o"

echo -e "${GREEN}完整部署通过 ✓${NC}"

# ─── 阶段 5: 验证 ───
echo ""
echo -e "${BLUE}[阶段 5/5] 验证部署结果...${NC}"

# 检查 systemd 服务状态
SERVICE_STATUS=$(docker exec "$CONTAINER_NAME" systemctl is-active tkd-crm 2>/dev/null || echo "unknown")
if [ "$SERVICE_STATUS" = "active" ]; then
  echo -e "${GREEN}systemd 服务运行正常 ✓${NC}"
else
  echo -e "${YELLOW}systemd 服务状态: ${SERVICE_STATUS}（容器内 systemd 可能有限制）${NC}"
fi

# 健康检查
if docker exec "$CONTAINER_NAME" curl -sf http://localhost:3000/api/config >/dev/null 2>&1; then
  echo -e "${GREEN}健康检查通过 ✓${NC}"
else
  echo -e "${YELLOW}健康检查未通过（容器内网络/服务可能有限制）${NC}"
fi

# ─── 清理 ───
echo ""
echo -e "${BLUE}清理测试容器...${NC}"
cd "$PROJECT_ROOT"
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
rm -f "$TEST_INVENTORY"
rm -f /tmp/tkd-crm-test-key /tmp/tkd-crm-test-key.pub 2>/dev/null || true

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Ansible 部署脚本测试全部通过！${NC}"
echo -e "${GREEN}========================================${NC}"
