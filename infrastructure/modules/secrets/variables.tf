variable "name_prefix" {
  type = string
}

variable "db_username" {
  type = string
}

variable "langsmith_api_key" {
  type      = string
  default   = ""
  sensitive = true
}
