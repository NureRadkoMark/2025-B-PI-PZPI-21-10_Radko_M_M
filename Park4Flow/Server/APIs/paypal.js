const axios = require('axios')

async function generateAccessToken() {
    const response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET_KEY
        }
    })
    console.log(response)
    return response.data.access_token
}

const createOrder = async (currency, amount, description) => {
    try {
        const accessToken = await generateAccessToken()

        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [{
                    items: [{
                        name: 'Bachelor project parking system',
                        description: description,
                        quantity: 1,
                        unit_amount: {
                            currency_code: currency,
                            value: amount
                        }
                    }],
                    amount: {
                        currency_code: currency,
                        value: amount,
                        breakdown: {
                            item_total: {
                                currency_code: currency,
                                value: amount
                            }
                        }
                    }
                }],
                application_context: {
                    return_url: 'https://localhost:5190/payment-result',
                    cancel_url: 'https://localhost:5190/payment-result',
                    brand_name: 'Park4Flow'
                }
            }
        })

        return response.data.links.find(link => link.rel === 'approve').href
    } catch (error) {
        console.error('PayPal API Error:', error.response ? error.response.data : error.message)
    }
}

const captureOrder = async (orderID) => {
    try {
        const accessToken = await generateAccessToken()

        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })

        console.log('Success pay:', response.data)
        return response.data
    } catch (error) {
        console.error('Pay error:', error.response ? error.response.data : error.message)
        throw error
    }
}

module.exports = { createOrder, captureOrder }
