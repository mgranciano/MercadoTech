export interface TestUser {
  email: string
  password: string
  displayName: string
  role: 'buyer' | 'seller' | 'admin'
}

export const testUsers = {
  buyer: {
    email: 'buyer1@mercadotech.test',
    password: 'MercadoTech123!',
    displayName: 'Juan Comprador',
    role: 'buyer' as const,
  },
  seller: {
    email: 'seller1@mercadotech.test',
    password: 'MercadoTech123!',
    displayName: 'TechVendor SRL',
    role: 'seller' as const,
  },
  admin: {
    email: 'admin@mercadotech.test',
    password: 'MercadoTech123!',
    displayName: 'Admin MercadoTech',
    role: 'admin' as const,
  },
} as const satisfies Record<string, TestUser>
