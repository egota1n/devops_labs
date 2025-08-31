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
```

#### Удаление

```bash
# Удаление в Yandex Cloud
terraform destroy

# Удаление ненужного
rm -rf .terraform terraform.tfstate* .terraform.lock.hcl