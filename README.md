[![CI](https://github.com/egota1n/devops_labs/actions/workflows/ci.yml/badge.svg?branch=lab3)](https://github.com/egota1n/devops_labs/actions/workflows/ci.yml)

### Лабораторная работа №3

##### Создание ВМ
```
cd ./infrastructure/terraform

# Создание ВМ
terraform init
terraform plan
terraform apply
```

##### Установка Kubernetes
```
cd ./../ansible/

# Проверка доступности
ansible -i inventory.yml all -m ping -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"

# Установка Kubernetes
ansible-playbook -i inventory.yml install_kubernetes.yml -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"

# Развертывание веб-приложения
ansible-playbook -i inventory.yml deploy_app_kubernetes.yml -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"
```

##### Установка Hey
```
sudo apt update
sudo apt install golang-go -y
go install github.com/rakyll/hey@latest
export PATH=$PATH:$(go env GOPATH)/bin
sudo apt install hey

kubectl get svc backend

hey -z 2m -q 10 -c 2 http://10.105.154.88:3303/api/tasks/
watch -n 2 kubectl top pods -A
kubectl get hpa backend-hpa -n default -w
kubectl get hpa
```

##### Установка Prometheus + Grafana
```
# Установка Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

kubectl create namespace monitoring

# Установка Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --set server.resources.requests.cpu=100m \
  --set server.resources.requests.memory=128Mi

kubectl get pvc -n monitoring
kubectl get pods -n monitoring

helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --set server.persistentVolume.enabled=false \
  --set server.resources.requests.cpu=100m \
  --set server.resources.requests.memory=128Mi

kubectl patch svc prometheus-server -n monitoring -p '{"spec": {"type": "NodePort"}}'
kubectl get svc -n monitoring

# Установка Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword='yourpassword' \
  --set datasources."datasources\.yaml".apiVersion=1 \
  --set datasources."datasources\.yaml".datasources[0].name=Prometheus \
  --set datasources."datasources\.yaml".datasources[0].type=prometheus \
  --set datasources."datasources\.yaml".datasources[0].url=http://prometheus-server.monitoring.svc.cluster.local:80 \
  --set datasources."datasources\.yaml".datasources[0].access=proxy


kubectl patch svc grafana -n monitoring -p '{"spec":{"type":"NodePort"}}'
kubectl get svc grafana -n monitoring
```


##### Отключение taint
```
kubectl get pods -n monitoring

kubectl taint nodes fhmlt73mtlpsu4j4nkg4 node-role.kubernetes.io/control-plane:NoSchedule-
```

Prometheus
http://51.250.64.230:31064/

Grafana
http://51.250.64.230:30320/

Vue
http://51.250.64.230:31774/