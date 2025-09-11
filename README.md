### Лабораторная работа №3

```
cd ./infrastructure/terraform

# Создание ВМ
terraform init
terraform plan
terraform apply
```

```
# Установка Kubernetes
ansible-playbook -i inventory.yml install_kubernetes.yml -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)# Создание ВМ

# Создание ВМ
ansible-playbook -i inventory.yml deploy_app_kubernetes.yml -e "vm_ip=$(cd ../terraform && terraform output -raw vm_public_ip)"
```

```
sudo apt update
sudo apt install golang-go -y
go install github.com/rakyll/hey@latest
export PATH=$PATH:$(go env GOPATH)/bin
sudo apt install hey

kubectl get svc backend
hey -z 2m -q 10 -c 5 http://51.250.69.152:3303/
```

```
kubectl delete clusterrolebinding metrics-server-auth

kubectl create clusterrolebinding metrics-server-auth \
  --clusterrole=extension-apiserver-authentication-reader \
  --serviceaccount=kube-system:metrics-server

kubectl delete pod -n kube-system -l k8s-app=metrics-server
kubectl get pods -n kube-system -l k8s-app=metrics-server -w
```

```
# Установка Prometheus + Grafana
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```