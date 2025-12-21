# ERP System - Complete API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. SuperAdmin Module

### 1.1 Login SuperAdmin

**POST** `/super-admin/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "superadmin@erp.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Super Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "superAdmin": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Super Admin",
      "email": "superadmin@erp.com",
      "role": "SUPER_ADMIN",
      "isActive": true
    }
  }
}
```

### 1.2 Get SuperAdmin Profile

**GET** `/super-admin/profile`

**Access:** SuperAdmin only

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Super Admin",
    "email": "superadmin@erp.com",
    "role": "SUPER_ADMIN",
    "isActive": true,
    "lastLogin": "2025-01-21T08:30:00.000Z"
  }
}
```

### 1.3 Update SuperAdmin Profile

**PATCH** `/super-admin/profile`

**Access:** SuperAdmin only

**Request Body:**

```json
{
  "name": "Updated Admin Name"
}
```

**Response:** `200 OK`

### 1.4 Update SuperAdmin Password

**PATCH** `/super-admin/password`

**Access:** SuperAdmin only

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`

---

## 2. Company Module

### 2.1 Register Company

**POST** `/companies/register`

**Access:** Public

**Request Body:**

```json
{
  "companyName": "ABC Corporation",
  "email": "admin@abc.com",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "adminName": "John Doe",
  "adminEmail": "john@abc.com",
  "adminPhone": "0987654321",
  "adminPassword": "password123"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Company registration successful. Awaiting admin approval.",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439012",
      "companyName": "ABC Corporation",
      "email": "admin@abc.com",
      "status": "PENDING"
    },
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@abc.com",
      "role": "COMPANY_ADMIN",
      "isActive": false
    }
  }
}
```

### 2.2 Get All Companies

**GET** `/companies?status=PENDING&page=1&limit=20`

**Access:** SuperAdmin only

**Query Parameters:**

- `status` (optional): PENDING | APPROVED | SUSPENDED | REJECTED
- `search` (optional): Search by company name or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [...],
    "metadata": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### 2.3 Approve Company

**PATCH** `/companies/:id/approve`

**Access:** SuperAdmin only

**Request Body:**

```json
{
  "subscription": {
    "plan": "PREMIUM",
    "features": ["unlimited_users", "advanced_reports"]
  }
}
```

**Response:** `200 OK`

### 2.4 Suspend Company

**PATCH** `/companies/:id/suspend`

**Access:** SuperAdmin only

**Response:** `200 OK`

### 2.5 Reject Company

**PATCH** `/companies/:id/reject`

**Access:** SuperAdmin only

**Response:** `200 OK`

### 2.6 Update Company

**PATCH** `/companies/:id`

**Access:** SuperAdmin, Company Admin

**Request Body:**

```json
{
  "companyName": "Updated Name",
  "settings": {
    "currency": "USD",
    "timezone": "America/New_York",
    "taxRate": 8.5
  }
}
```

**Response:** `200 OK`

### 2.7 Delete Company

**DELETE** `/companies/:id`

**Access:** SuperAdmin only

**Response:** `200 OK`

---

## 3. Auth/User Module

### 3.1 Login User

**POST** `/auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "john@abc.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@abc.com",
      "role": "COMPANY_ADMIN",
      "companyId": "507f1f77bcf86cd799439012"
    }
  }
}
```

### 3.2 Logout User

**POST** `/auth/logout`

**Access:** Authenticated

**Response:** `200 OK`

### 3.3 Update Profile

**PATCH** `/auth/profile`

**Access:** All authenticated users

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "1112223333"
}
```

**Response:** `200 OK`

### 3.4 Update Password

**PATCH** `/auth/password`

**Access:** All authenticated users

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`

### 3.5 Get Company Users

**GET** `/auth/users?role=MANAGER&page=1&limit=10`

**Access:** Company Admin

**Query Parameters:**

- `email` (optional): Filter by email
- `role` (optional): Filter by role
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`

### 3.6 Create User

**POST** `/auth/users`

**Access:** Company Admin

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@abc.com",
  "phone": "5556667777",
  "password": "password123",
  "role": "MANAGER"
}
```

**Response:** `201 Created`

### 3.7 Update User Role

**PATCH** `/auth/users/:id/role`

**Access:** Company Admin

**Request Body:**

```json
{
  "role": "MANAGER"
}
```

**Response:** `200 OK`

### 3.8 Toggle User Active Status

**PATCH** `/auth/users/:id/active`

**Access:** Company Admin

**Response:** `200 OK`

### 3.9 Delete User

**POST** `/auth/users/:id/delete`

**Access:** Company Admin, Manager

**Response:** `200 OK`

---

## 4. Product Module

### 4.1 Create Category

**POST** `/products/categories`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

**Response:** `201 Created`

### 4.2 Get All Categories

**GET** `/products/categories`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 4.3 Update Category

**PATCH** `/products/categories/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 4.4 Delete Category

**DELETE** `/products/categories/:id`

**Access:** Company Admin

**Response:** `200 OK`

### 4.5 Create Brand

**POST** `/products/brands`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "name": "Apple",
  "description": "Apple Inc.",
  "logo": "https://example.com/apple-logo.png"
}
```

**Response:** `201 Created`

### 4.6 Get All Brands

**GET** `/products/brands`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 4.7 Update Brand

**PATCH** `/products/brands/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 4.8 Delete Brand

**DELETE** `/products/brands/:id`

**Access:** Company Admin

**Response:** `200 OK`

### 4.9 Create Product

**POST** `/products`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "name": "MacBook Pro 16\"",
  "sku": "MBP-16-2024",
  "description": "Latest MacBook Pro with M3 chip",
  "categoryId": "507f1f77bcf86cd799439014",
  "brandId": "507f1f77bcf86cd799439015",
  "images": [
    {
      "url": "https://example.com/macbook.jpg",
      "publicId": "macbook_001"
    }
  ],
  "basePrice": 2499,
  "costPrice": 2000,
  "taxRate": 8.5,
  "unit": "pcs"
}
```

**Response:** `201 Created`

### 4.10 Get All Products

**GET** `/products?categoryId=xxx&search=macbook&page=1&limit=20`

**Access:** Company Admin, Manager

**Query Parameters:**

- `categoryId` (optional): Filter by category
- `brandId` (optional): Filter by brand
- `search` (optional): Search by product name
- `page`, `limit`: Pagination

**Response:** `200 OK`

### 4.11 Get Product by ID

**GET** `/products/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 4.12 Update Product

**PATCH** `/products/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 4.13 Delete Product

**DELETE** `/products/:id`

**Access:** Company Admin

**Response:** `200 OK`

---

## 5. Inventory Module

### 5.1 Get Inventory

**GET** `/inventory?lowStock=true&page=1&limit=20`

**Access:** Company Admin, Manager

**Query Parameters:**

- `lowStock` (optional): Filter low stock items (boolean)
- `productId` (optional): Filter by product
- `page`, `limit`: Pagination

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": {
    "inventory": [
      {
        "id": "507f1f77bcf86cd799439016",
        "productId": {
          "name": "MacBook Pro 16\"",
          "sku": "MBP-16-2024"
        },
        "currentStock": 5,
        "minStockLevel": 10,
        "lastRestockDate": "2025-01-15T10:00:00.000Z"
      }
    ],
    "metadata": {...}
  }
}
```

### 5.2 Stock In

**POST** `/inventory/stock-in`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "productId": "507f1f77bcf86cd799439017",
  "quantity": 50,
  "reason": "Purchase from supplier",
  "notes": "Invoice #INV-001"
}
```

**Response:** `200 OK`

### 5.3 Adjust Stock

**POST** `/inventory/adjust`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "productId": "507f1f77bcf86cd799439017",
  "quantity": -5,
  "reason": "Damaged items",
  "notes": "5 units damaged during inspection"
}
```

**Response:** `200 OK`

### 5.4 Get Stock Movements

**GET** `/inventory/movements?productId=xxx&type=IN&startDate=2025-01-01`

**Access:** Company Admin, Manager

**Query Parameters:**

- `productId` (optional): Filter by product
- `type` (optional): IN | OUT | ADJUSTMENT
- `startDate`, `endDate` (optional): Date range
- `page`, `limit`: Pagination

**Response:** `200 OK`

---

## 6. Sales/Invoice Module

### 6.1 Create Invoice

**POST** `/sales`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "customerId": "507f1f77bcf86cd799439018",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439017",
      "productName": "MacBook Pro 16\"",
      "quantity": 2,
      "unitPrice": 2499,
      "discount": 100,
      "tax": 212.33
    }
  ],
  "discount": 0,
  "paymentMethod": "CASH",
  "paidAmount": 5110.66
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoiceNumber": "INV-202501-0001",
    "grandTotal": 5110.66,
    "paymentStatus": "PAID",
    "status": "COMPLETED"
  }
}
```

### 6.2 Get All Invoices

**GET** `/sales?status=COMPLETED&paymentStatus=PAID&page=1`

**Access:** Company Admin, Manager

**Query Parameters:**

- `status` (optional): COMPLETED | CANCELLED | REFUNDED
- `paymentStatus` (optional): PAID | PARTIAL | DUE
- `customerId` (optional): Filter by customer
- `startDate`, `endDate` (optional): Date range
- `page`, `limit`: Pagination

**Response:** `200 OK`

### 6.3 Get Invoice by ID

**GET** `/sales/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 6.4 Cancel Invoice

**PATCH** `/sales/:id/cancel`

**Access:** Company Admin

**Response:** `200 OK`

### 6.5 Refund Invoice

**PATCH** `/sales/:id/refund`

**Access:** Company Admin

**Response:** `200 OK`

---

## 7. Customer Module

### 7.1 Create Customer

**POST** `/customers`

**Access:** Company Admin, Manager

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "1112223333",
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zip": "02101"
  },
  "notes": "VIP customer"
}
```

**Response:** `201 Created`

### 7.2 Get All Customers

**GET** `/customers?search=jane&page=1&limit=20`

**Access:** Company Admin, Manager

**Query Parameters:**

- `search` (optional): Search by name, phone, or email
- `page`, `limit`: Pagination

**Response:** `200 OK`

### 7.3 Get Customer by ID

**GET** `/customers/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 7.4 Get Customer Purchase History

**GET** `/customers/:id/history?page=1&limit=10`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 7.5 Update Customer

**PATCH** `/customers/:id`

**Access:** Company Admin, Manager

**Response:** `200 OK`

### 7.6 Delete Customer

**DELETE** `/customers/:id`

**Access:** Company Admin

**Response:** `200 OK`

---

## 8. Role Upgrade Request Module

### 8.1 Create Role Request

**POST** `/role-requests`

**Access:** User only

**Request Body:**

```json
{
  "reason": "I have 2 years of experience and would like to take on more responsibilities"
}
```

**Response:** `201 Created`

### 8.2 Get User's Own Requests

**GET** `/role-requests/my-requests`

**Access:** User only

**Response:** `200 OK`

### 8.3 Get All Role Requests

**GET** `/role-requests?status=PENDING&page=1`

**Access:** Company Admin

**Query Parameters:**

- `status` (optional): PENDING | APPROVED | REJECTED
- `page`, `limit`: Pagination

**Response:** `200 OK`

### 8.4 Approve Role Request

**PATCH** `/role-requests/:id/approve`

**Access:** Company Admin

**Request Body:**

```json
{
  "reviewNotes": "Approved based on excellent performance"
}
```

**Response:** `200 OK`

### 8.5 Reject Role Request

**PATCH** `/role-requests/:id/reject`

**Access:** Company Admin

**Request Body:**

```json
{
  "reviewNotes": "Need more experience"
}
```

**Response:** `200 OK`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "You are not authorized!"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Forbidden: MANAGER cannot delete product"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing with cURL

### Example: Complete Flow

```bash
# 1. Register Company
curl -X POST http://localhost:5000/api/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "email": "admin@test.com",
    "phone": "1234567890",
    "adminName": "Test Admin",
    "adminEmail": "testadmin@test.com",
    "adminPhone": "0987654321",
    "adminPassword": "password123"
  }'

# 2. SuperAdmin Login
curl -X POST http://localhost:5000/api/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp.com",
    "password": "password123"
  }'

# 3. Approve Company (use token from step 2)
curl -X PATCH http://localhost:5000/api/companies/{companyId}/approve \
  -H "Authorization: Bearer {superadmin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "plan": "PREMIUM"
    }
  }'

# 4. Company Admin Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@test.com",
    "password": "password123"
  }'

# 5. Create Product (use token from step 4)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer {company_admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "categoryId": "{categoryId}",
    "basePrice": 100
  }'
```

---

## Postman Collection

Import this collection into Postman for easy testing:

**Collection Variables:**

- `baseUrl`: `http://localhost:5000/api`
- `superAdminToken`: (set after SuperAdmin login)
- `companyAdminToken`: (set after Company Admin login)
- `managerToken`: (set after Manager login)
- `userToken`: (set after User login)

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- SuperAdmin endpoints: 500 requests per 15 minutes

---

## Pagination

All list endpoints support pagination:

- Default `page`: 1
- Default `limit`: 20
- Maximum `limit`: 100

**Response includes metadata:**

```json
{
  "metadata": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```
