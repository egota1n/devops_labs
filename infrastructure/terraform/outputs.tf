output "vm_public_ip" {
  description = "Public IP address of the created VM"
  value       = yandex_compute_instance.vm.network_interface[0].nat_ip_address
}

output "vm_private_ip" {
  description = "Private IP address of the created VM"
  value       = yandex_compute_instance.vm.network_interface[0].ip_address
}

output "vm_id" {
  description = "ID of the created virtual machine"
  value       = yandex_compute_instance.vm.id
}

output "vm_name" {
  description = "Name of the created virtual machine"
  value       = yandex_compute_instance.vm.name
}

output "vm_status" {
  description = "Status of the virtual machine"
  value       = yandex_compute_instance.vm.status
}

output "network_id" {
  description = "ID of the created network"
  value       = yandex_vpc_network.network.id
}

output "subnet_id" {
  description = "ID of the created subnet"
  value       = yandex_vpc_subnet.subnet.id
}

output "ssh_connection_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh ${var.vm_username}@${yandex_compute_instance.vm.network_interface[0].nat_ip_address}"
}