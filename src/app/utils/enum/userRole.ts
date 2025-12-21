/**
 * User role enumeration for ERP system
 * SUPER_ADMIN: System owner with full access to all companies
 * COMPANY_ADMIN: Company owner with full access to their company
 * MANAGER: Partial control within a company
 * USER: Basic operational role
 */
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
}
