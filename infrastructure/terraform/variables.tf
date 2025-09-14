variable "yc_token" {
  description = "Yandex Cloud OAuth token"
  type        = string
  sensitive   = true
}

variable "yc_cloud_id" {
  description = "Yandex Cloud ID"
  type        = string
  sensitive   = true
}

variable "yc_folder_id" {
  description = "Yandex Cloud Folder ID"
  type        = string
  sensitive   = true
}

variable "vm_username" {
  description = "Username for VM access"
  type        = string
  default     = "ubuntu"
}

variable "vm_image_id" {
  description = "Base image ID for VM"
  type        = string
  default     = "fd827b91d99psvq5fjit" # Ubuntu 20.04 LTS
}

variable "vm_zone" {
  description = "Zone for VM deployment"
  type        = string
  default     = "ru-central1-a"
}

variable "vm_cores" {
  description = "Number of CPU cores"
  type        = number
  default     = 2
}

variable "vm_memory" {
  description = "Amount of memory in GB"
  type        = number
  default     = 4
}

variable "vm_disk_size" {
  description = "Boot disk size in GB"
  type        = number
  default     = 20
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}