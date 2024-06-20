module.exports = function makeVerifyPayment(db,E,utils) {
    return async function Verify(req, res) {
        const payment_id = req.params.id;
        const response = await axios.get(`https://developers.flouci.com/api/verify_payment/${payment_id}`, {
        headers: {
            'Content-Type': 'application/json',
            'apppublic': '5bbda72e-4d7b-48bd-a086-cc4711a623a8',
            'appsecret': process.env.FLOUCI_SECRET,
        },
        });

        if (response.status === 200) {
        res.send(response.data);
        } else {
        res.status(500).send({ error: 'Payment verification failed' });
        }
    }
}