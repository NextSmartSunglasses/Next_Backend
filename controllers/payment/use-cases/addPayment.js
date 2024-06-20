module.exports = function makeAddPayment(db,E,utils) {
    return async function Add(req, res) {
        const url = "https://developers.flouci.com/api/generate_payment";
    
        const payload = {
            "app_token": "5bbda72e-4d7b-48bd-a086-cc4711a623a8",
            "app_secret": process.env.FLOUCI_SECRET || '',
            "amount": req.body.amount*1000,
            "accept_card": "true",
            "session_timeout_secs": 1200,
            "success_link": "http://localhost:4000/success",
            "fail_link": "http://localhost:4000/fail",
            "developer_tracking_id": "beb35541-adec-4e47-b1ec-fe60a3418983"
        };
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error data:', errorData);
    
                if (errorData.fieldErrors && errorData.fieldErrors.length > 0) {
                    errorData.fieldErrors.forEach(fieldError => {
                        console.error(`Field: ${fieldError.field}, Message: ${fieldError.message}`);
                    });
                }
    
                res.status(response.status).json({ error: 'Internal Server Error' });
                return;
            }
    
            const result = await response.json();
            console.log("RESULT", result)
            res.json(result);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}