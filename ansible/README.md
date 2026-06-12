# 跆拳道馆 CRM —— Ansible 部署方案

基于 Ansible 的自动化部署方案，在 RedHat 系服务器上通过 RPM 包直接安装 Node.js 与 PostgreSQL，并通过 systemd 管理服务。默认配置适配 Fedora 默认仓库路径。

---

## 前置要求

- **控制机**（你的电脑）：Ansible >= 2.12、Python 3、SSH 客户端
- **目标服务器**：CentOS 7/8、RHEL 8/9、Rocky Linux、AlmaLinux、Fedora 等 RedHat 系系统，可 SSH 登录，有 sudo 或 root 权限

```bash
# macOS
brew install ansible

# CentOS/RHEL/Rocky/AlmaLinux/Fedora
sudo dnf install ansible
```

---

## 文件结构

```
ansible/
├── README.md              # 本文件
├── .gitignore             # 排除敏感配置文件
├── ansible.cfg            # Ansible 全局配置
├── inventory.yml          # 目标服务器清单（敏感，勿提交）
├── inventory.yml.example  # 清单模板示例
├── playbook.yml           # 完整部署入口
├── deploy-only.yml        # 仅更新应用（不装基础环境）
├── group_vars/
│   ├── all.yml            # 全局变量（敏感，勿提交）
│   └── all.yml.example    # 变量模板示例
└── roles/
    ├── precheck/          # 收集目标系统信息，校验 RedHat 系环境
    ├── system_setup/      # 通过 RPM 安装 Node.js + PostgreSQL + 创建运行用户/数据库
    ├── app_deploy/        # 上传代码、npm ci、prisma generate、build
    └── systemd_service/   # 创建 systemd 服务、启动、健康检查
```

---

## 配置步骤

### 1. 配置目标服务器

复制示例文件并修改：

```bash
cp ansible/inventory.yml.example ansible/inventory.yml
cp ansible/group_vars/all.yml.example ansible/group_vars/all.yml
```

编辑 `ansible/inventory.yml`：

```yaml
all:
  children:
    tkd_crm_servers:
      hosts:
        tkd-crm-prod:
          ansible_host: 192.168.1.100   # ← 改为你的服务器 IP
          ansible_user: root
          ansible_ssh_private_key_file: ~/.ssh/id_rsa
```

编辑 `ansible/group_vars/all.yml`：

```yaml
postgres_password: "your-secure-password"   # ← 数据库密码
openai_api_key: "sk-your-key"               # ← AI API Key
model: "openai:gpt-4o"
```

> ⚠️ **安全提醒**：`inventory.yml` 和 `group_vars/all.yml` 包含敏感信息，已加入 `.gitignore`，请勿手动添加到 Git。

---

## 部署命令

### 首次完整部署

安装 Node.js、PostgreSQL，创建数据库与用户，上传代码，构建并启动 systemd 服务：

```bash
ansible-playbook ansible/playbook.yml
```

### 仅更新应用

代码有变更时，不重复安装基础环境，只重新上传和构建：

```bash
ansible-playbook ansible/deploy-only.yml
```

### 查看部署状态

```bash
ansible tkd_crm_servers -a "systemctl status tkd-crm"
ansible tkd_crm_servers -a "journalctl -u tkd-crm -f"
```

---

## 运维命令（在目标服务器执行）

```bash
systemctl start tkd-crm       # 启动
systemctl stop tkd-crm        # 停止
systemctl restart tkd-crm     # 重启
systemctl status tkd-crm      # 查看状态
journalctl -u tkd-crm -f      # 实时日志
```

数据库运维：

```bash
systemctl status postgresql
journalctl -u postgresql -f
```

---

## 架构说明

| 组件 | 说明 |
|------|------|
| Node.js | 通过 NodeSource RPM 仓库安装 Node.js 22 |
| PostgreSQL | 通过系统默认 RPM 仓库安装（Fedora 默认包为 `postgresql-server`），服务名可在 `group_vars/all.yml` 配置 |
| 运行用户 | 专用系统用户 `tkd-crm`，工作目录 `/opt/tkd-crm` |
| 服务管理 | systemd 服务 `tkd-crm.service`，依赖并等待 PostgreSQL 服务，开机自启 |
| 照片存储 | `/opt/tkd-crm/public/uploads/` |
| 数据库数据 | PostgreSQL 默认数据目录 `/var/lib/pgsql/16/data/` |

---

## 常见问题

**Q: 目标服务器不是 RedHat 系怎么办？**  
A: 当前部署方案仅支持 RedHat 系操作系统（CentOS/RHEL/Rocky/AlmaLinux/Fedora），因为统一通过 RPM 包安装 Node.js 与 PostgreSQL。如使用 Debian/Ubuntu，请自行准备对应包管理命令或使用其他部署方式。

**Q: 如何修改应用端口？**  
A: 在 `group_vars/all.yml` 中修改 `app_port: 3000`，并重新执行 `ansible-playbook ansible/deploy-only.yml`。

**Q: 部署后如何更新代码？**  
A: 使用 `ansible-playbook ansible/deploy-only.yml`，只重新上传代码和构建，不改动数据库和基础环境。

**Q: 如何修改 PostgreSQL 服务名？**  
A: 在 `group_vars/all.yml` 中修改 `postgresql_service_name`（默认为 `postgresql`，适配 Fedora 默认仓库），并重新执行部署。
