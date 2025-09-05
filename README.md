### Лабораторная работа №2

#### Установка и запуск

##### Запуск terraform
```bash
cd infrastructure/terraform/

# Ициализация
terraform init

# Запланирование развертывания
terraform plan

# Применение конфигурации
terraform apply
```

##### Запуск ansible
```bash
cd ./../ansible/

# Проверка доступности
ansible -i inventory.yml all -m ping -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"

# Установка Docker
ansible-playbook -i inventory.yml playbook.yml -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"

# Деплой приложения из Docker Hub
ansible-playbook -i inventory.yml deploy_app.yml -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"
```

##### Docker Hub
```bash
# Сборка образов
docker-compose build

# Проверка содержимого образов
docker run --rm devops_labs-backend ls -la /app
docker run --rm devops_labs-frontend ls -la /usr/share/nginx/html

# Запуск локально для теста
docker-compose up -d
curl http://localhost:80
curl http://localhost:3303/api/tasks

# Тегирование
docker login
docker tag devops_labs-backend egor1248/devops_labs-backend:amd64
docker tag devops_labs-frontend egor1248/devops_labs-frontend:amd64

# Пуш образов
docker push egor1248/devops_labs-backend:amd64
docker push egor1248/devops_labs-frontend:amd64
```

##### Развертывание на ВМ
```bash
# Подгрузка образов из Docker Hub
docker pull egor1248/devops_labs-backend:amd64
docker pull egor1248/devops_labs-frontend:amd64

# Mongo
docker run -d --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_DATABASE=taskmanager \
  mongo:6

# Back-end
docker run -d --name backend -p 3303:3303 \
  --link mongodb:mongodb \
  -e MONGODB_URI=mongodb://mongodb:27017/taskmanager \
  -e NODE_ENV=production \
  egor1248/devops_labs-backend:amd64

curl http://localhost:3303/api/health || echo "Еще не готов"

# Front-end
docker run -d --name frontend -p 80:80 \
  --link backend:backend \
  egor1248/devops_labs-frontend:amd64
```

#### Удаление ВМ

```bash
# Удаление в Yandex Cloud
terraform destroy

# Удаление ненужного
rm -rf .terraform terraform.tfstate* .terraform.lock.hcl
```