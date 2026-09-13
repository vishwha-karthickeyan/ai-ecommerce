const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getProducts(search?: string) {
  const url = new URL(`${API_URL}/products`)
  if (search) url.searchParams.append('search', search)

  const res = await fetch(url.toString())
  return res.json()
}

export async function getProduct(id: string | number) {
  const res = await fetch(`${API_URL}/products/${id}`)
  return res.json()
}

export async function placeOrder(order: {
  user_email: string
  products: any[]
  total: number
}) {
  const res = await fetch(`${API_URL}/place-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  })

  return res.json()
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  return res.json()
}

export async function signupUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })

  return res.json()
}

export async function sendMessage(message: string) {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  return res.json()
}