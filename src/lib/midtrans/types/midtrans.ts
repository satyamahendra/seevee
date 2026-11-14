export type Address = {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    postal_code?: string
    country_code?: string
}

export type ItemDetail = {
    id: string
    price: number
    quantity: number
    name: string
}

export type TokenParameter = {
    transaction_details: {
        order_id: string
        gross_amount: number
    }
    credit_card: {
        secure: boolean
    }
    item_details: ItemDetail[]
    callbacks?: {finish?: string}
    customer_details: {
        first_name?: string
        last_name?: string
        email: string
        phone?: string
        billing_address?: Address
        shipping_address?: Address
    }
}
